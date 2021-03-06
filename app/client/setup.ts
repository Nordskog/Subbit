import * as api from "~/common/api";
import * as toast from "~/client/toast";
import * as tools from '~/common/tools';
import * as sessionActions from '~/client/actions/direct/session';
import * as historyActions from "~/client/actions/direct/history";

/////////////////////////////////////////////////////
// Register callbacks to display ratelimit toasts
/////////////////////////////////////////////////////

let prevRemaining : number = 0;
function handleRatelimitCallback( info : tools.RateLimitInfo )
{
    // Gets triggered once when it goes below 500, then not again until
    // after it has been above that number again
    if (info.remaining < 100 && info.remaining > prevRemaining && info.used > 0)
    {
        prevRemaining = info.remaining;

        let resetTime = info.resetAt - (Date.now() / 1000);
        resetTime = Math.floor(resetTime);
        
        toast.countdownToast( toast.ToastType.WARNING, 10000, resetTime,  "Approaching Reddit rate limit", "Reset in", "seconds");
    }
}

function handleRateLimitedCallback(  info : tools.RateLimitInfo )
{
    let resetTime = info.resetAt - (Date.now() / 1000);
    resetTime = Math.floor(resetTime);

    toast.countdownToast( toast.ToastType.ERROR, resetTime * 1000, resetTime,  "Reddit rate limit exceeded", "Reset in", "seconds");
}

function evaluateSessionState()
{
    // Last fetched authors are retained in sessionStorage and reloaded
    // so the page can be rendered instantly. Clear if navigation type is not TYPE_BACK_FORWARD
    // History handles location changes that do not load/unload the page.
    if (performance.navigation.type !== PerformanceNavigation.TYPE_BACK_FORWARD)
    {
        sessionActions.clear();
    }
}

function registerUnloadCallbacks()
{

    window.addEventListener( "beforeunload", ( event : BeforeUnloadEvent ) => 
    {
        // Detecting refresh events is difficult.
        // History logs this as a POP action rather than replace and incorrectly restores the saved state.
        // Session will restore the data only when appropriate, so just clear state for this location on page unload.
        historyActions.clearHistoryForCurrentLocation();

        // Any requests in progress when the user leaves the page will produce errors that
        // the browser will not allow us to detect as such. Any ongoing requests must be manually cancelled first.
        api.cancelAll();

        // So scroll restoration works fine in pretty much every scenario, with the exception of the
        // the first time the user follows a link and hits back after navigating to a new route.
        // This also happens to be the most common action by far.
        // This is only a problem when the page has been unloaded, so let session handle it.
        sessionActions.saveScroll(window.scrollY);
    });
}

export function setupClientStuff()
{
    evaluateSessionState();
    api.reddit.registerRatelimitCallbacks(handleRatelimitCallback, handleRateLimitedCallback);
    registerUnloadCallbacks();
    
}

