import * as Entity from '~/backend/entity'
import * as RFY from '~/backend/rfy'

import * as Scrape from '~/backend/scrape';

import * as models from '~/common/models';

import * as settings from '~/backend/settings';

import * as tools from '~/common/tools'

import * as events from '~/backend/events'
import { scrape } from '~/backend/actions';


let scrapeBot = null;

async function prepareWorklist()
{
    let subreddits : Entity.Subreddit[] = (await RFY.wetland.getManager().getRepository(Entity.Subreddit).find(  { autoscrape : true } )) || [];
    let worklist = [];

    subreddits.forEach( ( subreddit : Entity.Subreddit ) => 
    {
        /*
        worklist.push( 
            async () => {
                let job : Scrape.ActiveJob = await Scrape.scrapeLatestPostsFromSubreddit( 
                    RFY.wetland, 
                    subreddit.name,
                    models.ScrapeType.REDDIT );
        
                    await job.promise;
            }
        ) */

        return [];
    } );

    return worklist;
}

function callUpdateListeners( status : tools.IntervalBot.Status )
{
    events.callScrapeBotUpdatedListener(status);
}

///////////////////////
// External interface
////////////////////////


export async function updateScrapeBotConcurrentRequests( concurrentRequests : number)
{
    try         
    {   settings.getSettings().autoscrape_concurrent_requests = concurrentRequests; 
        settings.saveSettings();
    }
    catch (err) 
    { 
        console.log("fuckup: ",err);
    }

    scrapeBot.setConcurrentRequests(concurrentRequests);
}

export async function updateScrapeBotState( enable : boolean)
{
    settings.getSettings().autoscrape = enable;
    settings.saveSettings();

    if (enable)
    {
        scrapeBot.startBot();
    }
    else
    {
        scrapeBot.stopBot();
    }
}

export async function updateScrapeBotInterval( interval : number)
{
    settings.getSettings().autoscrape_interval_seconds = interval;
    settings.saveSettings();
    scrapeBot.setInterval(interval)
}

export async function initScrapeBot()
{
    let sets : Entity.Setting = settings.getSettings();

    scrapeBot = new tools.IntervalBot.Bot(    sets.autoscrape_concurrent_requests, 
        sets.autoscrape_interval_seconds,
        prepareWorklist,
        callUpdateListeners);

   if ( settings.getSettings().autoscrape )
   {
        console.log("Scrap bot enabled");
        scrapeBot.startBot();
   }
   else
   {
       console.log("Scrap bot not enabled");
   }
}

export async function scrapeNow()
{
    scrapeBot.runNow();
}

export function requestStateUpdate()
{
    scrapeBot.requestStateUpdate();
}

export function getState()
{
    return scrapeBot.getState();
}
