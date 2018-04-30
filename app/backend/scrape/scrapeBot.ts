import * as Entity from '~/backend/entity'
import * as RFY from '~/backend/rfy'

import * as Scrape from '~/backend/scrape';

import * as models from '~/common/models';

import * as settings from '~/backend/settings';

import * as events from '~/backend/events'


//I scrape at set intervals
let enabled = false;
let processing = false;

let activeRequests = 0;

let scrapeStartTime : Date = new Date(0);
let scrapeScheduledTime : Date =  new Date(0);

let scrapeJob = null;

let workListItemCount = 0;
const workList = [];


interface WorkItem
{
    id : number;
    name : string;
}

async function generateWorkList()
{
    //This is apparently the right way of doing it, believe it or not,
    workList.length = 0;

    let subreddits : Entity.Subreddit[] = (await RFY.wetland.getManager().getRepository(Entity.Subreddit).find(  { autoscrape : true } )) || [];

    subreddits.forEach( ( subreddit : Entity.Subreddit ) => 
    {
            workList.push( 
                {
                    id : subreddit.id,
                    name : subreddit.name
                })
    } );

    workListItemCount = workList.length;
    

    console.log(`added ${workList.length} subreddits to queue`);
}

async function processQueue()
{
    console.log(`Processing queue`);


    
    //If disabled or list empty, do nothing.
    if ( !processing || !enabled )
    {
        updateState();
        return;
    }

    //Last job finished, or not jobs to begin with.
    if (workList.length <= 0 && activeRequests <= 0)
    {
        processing = false;
        console.log("Scrape bot finished work");

        //Reschedule if still enabled
        if (enabled)
        {
            scheduleScrape();
        }
    }

    //Add jobs until concurrenct limit reached or list empty
    while( workList.length > 0 && activeRequests <  settings.getSettings().autoscrape_concurrent_requests)
    {
        activeRequests++;
        processItem( workList.pop() );
    }

    updateState();
}

export async function updateScrapeBotConcurrentRequests( concurrentRequests : number)
{
    try
    {
        settings.getSettings().autoscrape_concurrent_requests = concurrentRequests;
        settings.saveSettings();
    }
    catch (err)
    {
        console.log("fuckup: ",err);
    }

    updateState();
}

export async function updateScrapeBotState( enable : boolean)
{
    if (enable)
    {
        runScrapeBot();
    }
    else
    {
        stopScrapeBot();
    }

    updateState();
}

export async function updateScrapeBotInterval( interval : number)
{
    console.log("Setting interval to",interval);

    try
    {
        settings.getSettings().autoscrape_interval_seconds = interval;
        settings.saveSettings();
    }
    catch (err)
    {
        console.log("fuckup: ",err);
    }

    console.log("Interval now ",settings.getSettings().autoscrape_interval_seconds);

    if (enabled)
        scheduleScrape();

    updateState();
}

export async function runScrapeBot()
{
    console.log("Starting scrape bot");

    enabled = true;
    settings.getSettings().autoscrape = true;
    settings.saveSettings();
    scheduleScrape();

}

export async function initScrapeBot()
{
   if ( settings.getSettings().autoscrape )
   {
        console.log("Scrap bot enabled");
        runScrapeBot();
   }
   else
   {
       console.log("Scrap bot not enabled");
   }
}

export async function stopScrapeBot()
{
    console.log("Stopping scrape bot");

    //Can't do anything if already processing, but stop if scheduled.
    enabled = false;

    settings.getSettings().autoscrape = false;
    settings.saveSettings();

    if (scrapeJob != null)
    {
        clearTimeout(scrapeJob);
        scrapeJob = null;
    }

    updateState();
}

function removeSchedule()
{
    if (scrapeJob != null)
    {
        console.log("Scrape bot removing existing scheduled job");
        clearTimeout(scrapeJob);
        scrapeJob = null;
    }
}

async function scheduleScrape()
{

    removeSchedule();

    let interval = settings.getSettings().autoscrape_interval_seconds;

    console.log("Scheduling scrape job for",interval," seconds from now");
    scrapeScheduledTime = new Date( Date.now() + (interval * 1000) );
    scrapeJob = setTimeout( () => runScrape(), interval * 1000 );

    updateState();
}

async function runScrape()
{
    if (!enabled)
    {
        console.log("Attempted to run scrapeBot scrape even though bot is disabled");
        return;
    }

    if (processing)
    {
        console.log("Attempted to run scrapeBot scrape while already running");
        return;
    }

    console.log("Running scrape");

    scrapeStartTime = new Date();
    processing = true;
    await generateWorkList();
    processQueue();
}

export async function scrapeNow()
{
    removeSchedule();
    runScrape();

}

function updateState()
{
    events.callScrapeBotUpdatedListener(getState());
}

export function requestStateUpdate()
{
    updateState();
}

export function getState()
{
    let state : models.data.ScrapeBot

    state = 
    {
        enabled: enabled,
        interval: settings.getSettings().autoscrape_interval_seconds,
        concurrent_requests : settings.getSettings().autoscrape_concurrent_requests,

        processing : processing,
        run_start : scrapeStartTime.getTime() / 1000,
        next_run : scrapeScheduledTime.getTime() / 1000,

        worklist_active: activeRequests,
        worklist_total: workListItemCount,
        worklist_remaining: workList.length
    };

    return state;
}

async function processItem( item : WorkItem)
{
    console.log(`Bot scraping ${item.name}`);

    try
    {
        let job : Scrape.ActiveJob = await Scrape.scrapeLatestPostsFromSubreddit( 
            RFY.wetland, 
            item.name,
            models.ScrapeType.REDDIT );

            await job.promise;
    }
    catch ( err)
    {
        console.log("scrapeBot failed processing item: ",err);
    }

    activeRequests--;

    //Let queue know a slot is open
    processQueue();
}

