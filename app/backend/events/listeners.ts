import * as entities from '~/backend/entity'
import * as models from '~/common/models'

//////////////////
// Jobs
//////////////////

const jobUpdatedListeners : Set< ( job : entities.ScrapeJob) => void > = new Set< (job : entities.ScrapeJob) => void >();

export function addJobUpdatedListener(listener : (job : entities.ScrapeJob) => void)
{
    jobUpdatedListeners.add(listener);
}

export function removeJobUpdatedListener(listener : (job : entities.ScrapeJob) => void)
{
    jobUpdatedListeners.delete(listener);
}

export function callJobUpdatedListeners( job : entities.ScrapeJob)
{
    jobUpdatedListeners.forEach( ( listener : ( listener : entities.ScrapeJob) => void ) => 
    {
        listener(job);
    });
}

//////////////////
// ScrapeBot
//////////////////

const scrapeBotUpdatedListeners : Set< ( scrapeBot : models.data.ScrapeBot) => void > = new Set< (job : models.data.ScrapeBot) => void >();

export function addScrapeBotUpdatedListener(listener : (scrapeBot : models.data.ScrapeBot) => void)
{
    scrapeBotUpdatedListeners.add(listener);
}

export function removeScrapeBotUpdatedListener(listener : (scrapeBot : models.data.ScrapeBot) => void)
{
    scrapeBotUpdatedListeners.delete(listener);
}

export function callScrapeBotUpdatedListener( scrapeBot : models.data.ScrapeBot)
{
    scrapeBotUpdatedListeners.forEach( ( listener : ( listener : models.data.ScrapeBot) => void ) => 
    {
        listener(scrapeBot);
    });
}