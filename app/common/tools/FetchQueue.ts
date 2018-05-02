import * as tools from '~/common/tools'

interface RateLimitInfo
{
    remaining : number;
    resetAt: number;
}


class RateMonitor
{
    rateLimit: RateLimitInfo;
    queued : boolean = false;
    queue: QueueItem[] = [];
    rateLimitHeaderReceived = false;    //Ignore ratelimit until received in header

    activeRequests : number = 0;
    activeMax : number;

    constructor( maxConcurrent = 5 )
    {
        this.rateLimit = {remaining: 5, resetAt: 0};
        this.activeMax = maxConcurrent;
        if (this.activeMax < 1)
            this.activeMax = 1;
        if (this.rateLimit.remaining < this.activeMax)
            this.rateLimit.remaining = this.activeMax;
    }

    timeUntilRequestAllowed() : number
    {
        if (!this.rateLimitHeaderReceived)
            return 0;

        if ( this.rateLimit.remaining < 5 )
        {
            return this.rateLimit.resetAt - (Date.now() / 1000);
        }
        else
        {
            return 0;   //i.e. now
        }
    }

    slotsAvailable() : boolean
    {
        return (this.activeRequests < this.activeMax);
    }

    //Lower remaining by 1, and add 1 to active counter
    informOfRequest()
    {
        this.rateLimit.remaining = this.rateLimit.remaining - 1;
        this.activeRequests = this.activeRequests + 1;
    }

    informOfResponse()
    {
        this.activeRequests = this.activeRequests - 1;
    }

    clearRateLimit()
    {
        this.rateLimitHeaderReceived = false;
    }

    updateRateLimitInfo( remaining : number, resetIn: number)
    {
        this.rateLimitHeaderReceived = true;
        this.rateLimit.remaining = remaining;
        this.rateLimit.resetAt = (Date.now() / 1000) + resetIn;
    }
}

class QueueItem
{
    execute: () => Promise<Response>;
    resolve:(result) => void;
    reject: (reason) =>  void;

    constructor(execute, resolve, reject )
    {
        this.execute = execute;
        this.resolve = resolve;
        this.reject = reject;
    }
}

export default class RequestQueue
{
    monitor : RateMonitor;

    constructor( maxConcurrent = 5 )
    {
        this.monitor = new RateMonitor( maxConcurrent );
    }

    enqueue( execute : () => Promise<Response>  )
    {
        let promise = new Promise<Response>( (resolve, reject) =>
         {
            this.monitor.queue.push( new QueueItem( execute, resolve, reject  ) );
         });
    
         this.processQueue();
    
        return promise;
    }
    
    async processQueue()
    {
        if (!this.monitor.queued)
        {
            while(this.monitor.queue.length > 0 && this.monitor.slotsAvailable())
            {
                //Check ratelimit
                let timeUntilAllowed = this.monitor.timeUntilRequestAllowed();
    
                //console.log("Time until allowed: ", timeUntilAllowed);
    
                if (timeUntilAllowed <= 0)
                {
                    let queueItem = this.monitor.queue.shift();
                    this.processItem(queueItem);
                }
                else
                {
                    this.functionProcessDelayed( timeUntilAllowed );
                    break;
                }
    
            }
            
        }
    }
    
    async functionProcessDelayed(delaySeconds : number)
    {
        if (!this.monitor.queued)
        {   
            this.monitor.queued = true;
            console.log("Processing queued in ",delaySeconds," seconds");
            await tools.time.sleep( delaySeconds * 1000);
            this.monitor.queued = false;
            this.processQueue();
        }
        else
        {
            console.log("Attempted to process delayed when bool already true");
        }
    }
    
    async processItem( item : QueueItem)
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
            let remaining : number = Number(response.headers.get("X-Ratelimit-Remaining"));
            let resetIn : number = Number(response.headers.get("X-Ratelimit-Reset"));
            this.monitor.updateRateLimitInfo(remaining, resetIn);   //Rate limit header is ignored until we reach one
        }
        else
        {
            //No rate limit info in last repsonse? Act is if we never got any at all.
            this.monitor.clearRateLimit();
        }

        this.processQueue();
        item.resolve(response);
    }
    
    clearQueue()
    {
        for (let item of this.monitor.queue)
        {
            item.reject("Clearing queue");
        }
        this.monitor.queue = [];
    }
}