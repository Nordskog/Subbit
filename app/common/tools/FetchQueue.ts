import * as tools from '~/common/tools';
import { CancelledException, NetworkException, RatelimitException, Exception } from '~/common/exceptions';

import * as Log from '~/common/log';

export interface RateLimitInfo
{
    remaining : number;
    used : number;
    resetAt: number;
}


class RateMonitor
{
    public rateLimit: RateLimitInfo;
    public queued : boolean = false;
    public queue: QueueItem[] = [];
    public rateLimitHeaderReceived = false;    // Ignore ratelimit until received in header

    public activeRequests : number = 0;
    public activeMax : number;

    constructor( maxConcurrent = 5 )
    {
        this.rateLimit = {remaining: 5, resetAt: 0, used: 0};
        this.activeMax = maxConcurrent;
        if (this.activeMax < 1)
            this.activeMax = 1;
        if (this.rateLimit.remaining < this.activeMax)
            this.rateLimit.remaining = this.activeMax;
    }

    public clearQueue( reason : Exception )
    {
        for (let item of this.queue)
        {
            item.reject( reason );
        }

        this.queue.length = 0;
    }

    public timeUntilRequestAllowed() : number
    {
        if (!this.rateLimitHeaderReceived)
            return 0;

        if ( this.rateLimit.remaining < 5 )
        {
            return this.rateLimit.resetAt - (Date.now() / 1000);
        }
        else
        {
            return 0;   // i.e. now
        }
    }

    public slotsAvailable() : boolean
    {
        return (this.activeRequests < this.activeMax);
    }

    // Lower remaining by 1, and add 1 to active counter
    public informOfRequest()
    {
        this.rateLimit.remaining = this.rateLimit.remaining - 1;
        this.activeRequests = this.activeRequests + 1;
    }

    public informOfResponse()
    {
        this.activeRequests = this.activeRequests - 1;
    }

    public clearRateLimit()
    {
        this.rateLimitHeaderReceived = false;
    }

    public updateRateLimitInfo( remaining : number, resetIn: number, used : number)
    {
        this.rateLimitHeaderReceived = true;
        this.rateLimit.remaining = remaining;
        this.rateLimit.resetAt = (Date.now() / 1000) + resetIn;
        this.rateLimit.used = used;
    }
}

class QueueItem
{
    public execute: () => Promise<Response>;
    public resolve: (result) => void;
    public reject: (reason) =>  void;
    public rejected: boolean = false;

    constructor(execute, resolve, reject )
    {
        this.execute = execute;
        this.resolve = resolve;
        this.reject = reject;
    }
}

export type RateLimitCallback = ( info : RateLimitInfo) => void;

export default class RequestQueue
{
    private monitor : RateMonitor;
    private inProgress: Set<QueueItem> = new Set<QueueItem>();
    private rejectOnRatelimit : boolean = false;    // Reject any new requests when ratelimit hit

    private rateLimitCallback: ( info : RateLimitInfo) => void;
    private rateLimitedCallback: ( info : RateLimitInfo) => void;

    constructor( maxConcurrent = 5 )
    {
        this.monitor = new RateMonitor( maxConcurrent );
    }

    public registerRatelimitCallbacks( rateLimitCallback : RateLimitCallback, rateLimitedCallback : RateLimitCallback )
    {
        this.rateLimitCallback = rateLimitCallback;
        this.rateLimitedCallback = rateLimitedCallback;
    }

    public setRejectOnRateLimit( enabled : boolean  )
    {
        this.rejectOnRatelimit = enabled;
    }

    public enqueue( execute : () => Promise<Response>  )
    {
        if ( this.rejectOnRatelimit && this.monitor.queued)
        {
            throw new RatelimitException( "Ratelimit exceeded" );
        }

        let promise = new Promise<Response>( (resolve, reject) =>
         {
            this.monitor.queue.push( new QueueItem( execute, resolve, reject  ) );
         });
    
         this.processQueue();
    
        return promise;
    }

    private callRatelimitCallback()
    {
        if (this.rateLimitCallback != null)
        {
            this.rateLimitCallback( this.monitor.rateLimit );
        }
    }

    private callRateLimitedCallback()
    {
        if (this.rateLimitedCallback != null)
        {
            this.rateLimitedCallback( this.monitor.rateLimit );
        }
    }
    
    private async processQueue()
    {
        if (!this.monitor.queued)
        {
            while(this.monitor.queue.length > 0 && this.monitor.slotsAvailable())
            {
                // Check ratelimit
                let timeUntilAllowed = this.monitor.timeUntilRequestAllowed();
    
                if (timeUntilAllowed <= 0)
                {
                    let queueItem = this.monitor.queue.shift();
                    this.inProgress.add(queueItem);
                    this.processItem(queueItem);
                    this.callRatelimitCallback();
                }
                else
                {
                    this.callRateLimitedCallback();
                    this.functionProcessDelayed( timeUntilAllowed );
                    break;
                }
    
            }
            
        }
    }
    
    private async functionProcessDelayed(delaySeconds : number)
    {
        if (!this.monitor.queued)
        {   
            this.monitor.queued = true;
            Log.W(`Fetch queue exceeded ratelimit, will resume in: ${delaySeconds} seconds`);
            if (this.rejectOnRatelimit)
                this.monitor.clearQueue( new RatelimitException( "Ratelimit exceeded" ) );  // Only clearing queue, not ongoing

            await tools.time.sleep( delaySeconds * 1000);

            this.monitor.queued = false;
            this.processQueue();
        }
        else
        {
            Log.E(`Attempted to schedule fetch queue for later, but was already scheduled.`);
        }
    }
    
    private async processItem( item : QueueItem)
    {
        this.monitor.informOfRequest();

        let response;
        try
        {
            response = await item.execute();
        }
        catch (err)
        {
            item.reject(err);
            return;
        }

        this.monitor.informOfResponse();
    
        if ( response.headers.has("X-Ratelimit-Remaining") )
        {
            let used : number = Number(response.headers.get("X-Ratelimit-Used"));
            let remaining : number = Number(response.headers.get("X-Ratelimit-Remaining"));
            let resetIn : number = Number(response.headers.get("X-Ratelimit-Reset"));
            this.monitor.updateRateLimitInfo(remaining, resetIn, used);   // Rate limit header is ignored until we reach one
        }
        else
        {
            // No rate limit info in last repsonse? Act is if we never got any at all.
            this.monitor.clearRateLimit();
        }

        this.processQueue();

        if (item.rejected)
            return;

        item.resolve(response);
    }
    
    // Clears queue AND ongoing
    public clearQueue( reason? : Exception )
    {
        if (reason == null)
            reason = new CancelledException("Fetch queue was cleared");
        this.monitor.clearQueue(reason);

        this.inProgress.forEach( ( item : QueueItem) => 
        {
            item.rejected = true;
            item.reject( reason );
        });
        
        this.inProgress.clear();


    }
}
