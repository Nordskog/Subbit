import * as tools from '~/common/tools'

export interface RateLimitInfo
{
    remaining : number;
    resetAt: number;
}


class RateMonitor
{
    rateLimit: RateLimitInfo;
    inProgress : boolean = false;
    queued : boolean = false;
    queue: QueueItem[] = [];

    constructor()
    {
        this.rateLimit = {remaining: 50, resetAt: 0};
    }

    timeUntilRequestAllowed() : number
    {
        if ( this.rateLimit.remaining < 5 )
        {
            return this.rateLimit.resetAt - (Date.now() / 1000);
        }
        else
        {
            return 0;   //i.e. now
        }

    }

    updateRateLimitInfo( remaining : number, resetIn: number)
    {
        //console.log("Remaining: ", remaining, "resetIn: ",resetIn);

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

const monitor : RateMonitor = new RateMonitor();

export function enqueue( execute : () => Promise<Response>  )
{
    let promise = new Promise<Response>( (resolve, reject) =>
     {
        monitor.queue.push( new QueueItem( execute, resolve, reject  ) );
     });

     processQueue();

    return promise;
}

async function processQueue()
{
    if (!monitor.inProgress && !monitor.queued)
    {
        //console.log("Processing queue");

        monitor.inProgress = true;
        while(monitor.queue.length > 0)
        {
            //Check ratelimit
            let timeUntilAllowed = monitor.timeUntilRequestAllowed();

            //console.log("Time until allowed: ", timeUntilAllowed);

            if (timeUntilAllowed <= 0)
            {
                let queueItem = monitor.queue.shift();
                processItem(queueItem);
            }
            else
            {
                functionProcessDelayed( timeUntilAllowed );
                break;
            }

        }

        monitor.inProgress = false;
    }
}

async function functionProcessDelayed(delaySeconds : number)
{
    if (!monitor.queued)
    {   
        monitor.queued = true;
        console.log("Processing queued in ",delaySeconds," seconds");
        await tools.time.sleep( delaySeconds * 1000);
        monitor.queued = false;
        monitor.inProgress = false;
        processQueue();
    }
    else
    {
        console.log("Attempted to process delayed when bool already true");
    }


}

async function processItem( item : QueueItem)
{
    let response = await item.execute();

    //All requests should be authenticated via oauth2.
    //When grabbing posts listings without any user context,
    //we get cached results there is no ratelimit.
    if ( response.headers.has("X-Ratelimit-Remaining") )
    {
        let remaining : number = Number(response.headers.get("X-Ratelimit-Remaining"));
        let resetIn : number = Number(response.headers.get("X-Ratelimit-Reset"));
        monitor.updateRateLimitInfo(remaining, resetIn);
    }
    else
    {
        //No limit, assume we're good for a while.
        //I think 300 is the limit if you're not authenticated, so assume that.
        monitor.updateRateLimitInfo(300, 60);
    }

    item.resolve(response);
}

export function clearQueue()
{
    for (let item of monitor.queue)
    {
        item.reject("Clearing queue");
    }
    monitor.queue = [];
}



