

import { Wetland, QueryBuilder, EntityRepository, EntityManager, Scope, ArrayCollection } from 'wetland';
import * as models from '~/common/models'
import * as entities from '~/backend/entity'
import * as queue from '~/client/api/redditQueue/queue';
import * as scrape from '~/backend/scrape'
import * as api from '~/client/api'
import * as authentication from '~/backend/authentication'
import * as queries from '~/backend/resource/queries'

function getNewUrl( subreddit : string)
{
    //With raw_json=1 you get unescaped characters.
    return api.reddit.REDDIT_OAUTH_API_URL+"/r/"+subreddit+"/new.json?limit=100&raw_json=1";
}

export async function scrapeReddit(wetland: Wetland, scrape_to_time : Date = new Date(0) )
{
    let manager : Scope = wetland.getManager();
    let subreddits : entities.Subreddit[] = await manager.getRepository(entities.Subreddit).find();

    subreddits.forEach( async subreddit => 
    {
        console.log("Grabbing posts for /r/"+subreddit.name);
        
        try
        {
            let job : scrape.ActiveJob = await scrape.createJob(manager, subreddit, models.ScrapeType.REDDIT, new Date(), scrape_to_time);
            await processJob(wetland, manager, job);
        }
        catch ( err )
        {
            //This is fine.
            console.log("Scraping newest from reddit fauled because ",err);
        }
        
    });
}


export async function scrapeSubreddit(wetland: Wetland, subredditName : string, scrape_to_time : Date = new Date(0) ) : Promise<scrape.ActiveJob>
{
    let manager : Scope = wetland.getManager();
    let subreddit : entities.Subreddit = await manager.getRepository(entities.Subreddit).findOne({ name: subredditName }, {})

    if (subreddit == null)
    {
        throw new Error(`Tried to crawl pushshift for subreddit that does not exist in local database`);
    }

    console.log("Grabbing posts for /r/"+subreddit.name);
    
    let job  : scrape.ActiveJob = null;
    try
    {
        job = await scrape.createJob(manager, subreddit, models.ScrapeType.REDDIT, new Date(), scrape_to_time);

        //Let caller decide if they want to await the result
        job.promise = processJob(wetland, manager, job);
    }
    catch ( err )
    {
        //This is fine.
        console.log("Scraping newest from reddit failed because ",err);
        throw new Error(`Scraping newest from reddit failed because ${err.message}`);
    }

    return job;

}

async function processJob(wetland: Wetland, manager : Scope, activeJob : scrape.ActiveJob)
{
    //let manager : Scope = wetland.getManager();

    let postsProcessed = 0;

    if (activeJob.job.status != models.ScrapeStatus.PENDING)
    {
        throw new Error(`Job ${activeJob.job.id} for ${activeJob.job.subreddit.name} will not be run because its status is ${activeJob.job.status}`);
    }

    try
    {
        //Whether new or old, attach to local manager.
        //activeJob.job = manager.attach(activeJob.job, true);  

        activeJob.job.status = models.ScrapeStatus.WORKING;
        activeJob.job.job_start_time = new Date();
        //activeJob.job.updatedAt = new Date();

        await manager.flush();

        let config = {
            method: "GET",
            headers: api.reddit.getOauthHeader( await authentication.redditAuth.getAppClientAccessToken()),
            'User-Agent': 'RFY crawler',
            'Content-Type': 'application/json'
            };

        let to_utc = Math.floor( (<Date>activeJob.job.scrape_to_time).getTime() / 1000 );
        let after;

        let pageNumber : number = 0;
        while(true)
        {
            if (activeJob.cancelRequested)
            {
                await scrape.endJob(manager,activeJob, models.ScrapeStatus.CANCELLED);
                break;
            }
        
            let url = getNewUrl(activeJob.job.subreddit.name);
            if (after)
            {
                url = url + "&after=" + after;
            }
    
            let response = await queue.enqueue( () => fetch(url, config) );
            {
                if (response.ok)
                {
                    let result = await response.json();
                    after = result.data.after;
                    let {last_created_utc, processed_count} = await scrape.parse.parsePostBatch(wetland, activeJob.job.subreddit, result.data.children.map( item => item.data ));
                    postsProcessed += processed_count;
    
                    activeJob.job.processed_count = postsProcessed;
                    //activeJob.job.updatedAt = new Date();
                    if (last_created_utc > 0)
                    {
                        //Empty list results in a last-post value of 0
                        activeJob.job.last_post_time = new Date(last_created_utc * 1000);
                    }
                    await manager.flush();

                    if (after == null)
                    {
                        console.log("No more pages for",activeJob.job.subreddit.name,"after",pageNumber,"pages");
                        break;
                    }
    
                    if (last_created_utc < to_utc)
                    {
                       console.log("Reached oldest post of",last_created_utc,"for",activeJob.job.subreddit.name,"after",pageNumber,"pages, limit was",to_utc);
                       break; 
                    }

                    if (activeJob.job.max_pages != null && pageNumber >= activeJob.job.max_pages)
                    {
                        console.log("Reached page limit for job for",activeJob.job.subreddit.name,"after",pageNumber,"pages");
                        break;
                    }
                }
                else
                {
                    throw new Error(`Reddit responded with status ${response.status}: ${response.statusText} for url ${url}`)
                }
            };

            pageNumber++;
        }

        //Update hot scores
        {
            //Use last post. If scrape end older use that.
            //Always update scores for the past ... week?
            let updateScoreRange = new Date(Date.now() - ( 7 * 60 * 60 * 24 ));
            if (updateScoreRange > activeJob.job.last_post_time)
                updateScoreRange = activeJob.job.last_post_time;
            if (updateScoreRange > activeJob.job.scrape_to_time)
                updateScoreRange = activeJob.job.scrape_to_time;
            await queries.post.updateHotScore(                  wetland.getStore().getConnection(), null, activeJob.job.subreddit.id, updateScoreRange);
            await queries.author.updateSubredditAuthorHotScore( wetland.getStore().getConnection(), null, activeJob.job.subreddit.id, updateScoreRange);
        }

        //If not working, something else has affected its status
        if (activeJob.job.status == models.ScrapeStatus.WORKING)
        {
            await scrape.endJob(manager,activeJob, models.ScrapeStatus.FINISHED);
        }

        console.log(`Created ${postsProcessed} posts for ${activeJob.job.subreddit.name}`)
    }
    catch(err)
    {
        console.log(`Problem scraping reddit: ${err}`);

        await scrape.endJob(manager,activeJob, models.ScrapeStatus.ERROR);

        throw new Error(err.message)
    }
}