import * as api from "~/common/api";
import * as toast from "~/client/toast";
import * as tools from '~/common/tools'



/////////////////////////////////////////////////////
// Register callbacks to display ratelimit toasts
/////////////////////////////////////////////////////

let prevRemaining : number = 0;
function handleRatelimitCallback( info : tools.RateLimitInfo )
{
    //Gets triggered once when it goes below 500, then not again until
    //after it has been above that number again
    if (info.remaining < 100 && info.remaining > prevRemaining && info.used > 0)
    {
        prevRemaining = info.remaining;

        let resetTime = info.resetAt - (Date.now() / 1000);
        resetTime = Math.floor(resetTime);
        
        toast.countdownToast( toast.ToastType.WARNING, 10000, resetTime,  "Approaching Reddit rate limit", "Reset in", "seconds")
    }
}

function handleRateLimitedCallback(  info : tools.RateLimitInfo )
{
    let resetTime = info.resetAt - (Date.now() / 1000);
    resetTime = Math.floor(resetTime);

    toast.countdownToast( toast.ToastType.ERROR, resetTime * 1000, resetTime,  "Reddit rate limit exceeded", "Reset in", "seconds")
}

export function setupClientStuff()
{
    api.reddit.registerRatelimitCallbacks(handleRatelimitCallback, handleRateLimitedCallback);
}

