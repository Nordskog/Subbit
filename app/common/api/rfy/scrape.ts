import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'
import * as api from '~/common/api'

export function requestScrapeJobUpdate( after : number, access_token: string) : Promise<models.data.ScrapeJob[]>
{
    return api.rfy.getRequest(
        '/scrape', 
        {
            "after": after
        },
        access_token    );
}

export function requestScrapeJob( payload : serverActions.scrape.REQUEST_SCRAPE, access_token: string) : Promise<models.data.ScrapeJob>
{
   return api.rfy.postRequest(
    '/scrape', 
    {
        type : serverActions.scrape.REQUEST_SCRAPE,
        payload : payload
    },
    access_token    );
}

export function setScrapeBotConcurrentRequests( concurrent_requests : number, access_token : string) : Promise<models.data.ScrapeBot>
{
   return api.rfy.postRequest(
    '/scrape', 
    {
        type :    serverActions.scrape.SET_AUTOSCRAPE_CONCURRENT_REQUESTS,
        payload : < serverActions.scrape.SET_AUTOSCRAPE_CONCURRENT_REQUESTS >
        {
            concurrent_requests : concurrent_requests
        }
    },
    access_token );
}

export function setScrapeBotInterval(interval : number, access_token : string) : Promise<models.data.ScrapeBot>
{
   return api.rfy.postRequest(
    '/scrape', 
    {
        type :    serverActions.scrape.SET_AUTOSCRAPE_INTERVAL,
        payload : < serverActions.scrape.SET_AUTOSCRAPE_INTERVAL >
        {
            interval : interval
        }
    },
    access_token );
}

export function toggleScrapeBot(enabled : boolean, access_token : string) : Promise<models.data.ScrapeBot>
{
   return api.rfy.postRequest(
    '/scrape', 
    {
        type :    serverActions.scrape.SET_AUTOSCRAPE,
        payload : < serverActions.scrape.SET_AUTOSCRAPE >
        {
            enabled : enabled
        }
    },
    access_token );
}

export function cancelScrapeJob( id : number, access_token: string) : Promise<models.data.ScrapeJob>
{
   return api.rfy.postRequest(
    '/scrape', 
    {
        type :    serverActions.scrape.CANCEL_SCRAPE,
        payload : < serverActions.scrape.CANCEL_SCRAPE >
        {
            id : id
        }
    },
    access_token );
}

export function scrapeBotScrapeNow( access_token : string) : Promise<models.data.ScrapeBot>
{
   return api.rfy.postRequest(
    '/scrape', 
    {
        type :    serverActions.scrape.RUN_AUTOSCRAPE_NOW,
        payload : < serverActions.scrape.RUN_AUTOSCRAPE_NOW >
        {
        }
    },
    access_token );
}