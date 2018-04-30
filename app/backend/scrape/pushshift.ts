

import { Wetland, QueryBuilder, EntityRepository, EntityManager, Scope, ArrayCollection } from 'wetland';
import * as models from '~/common/models'
import * as entities from '~/backend/entity'
import * as queue from '~/client/api/redditQueue/queue';
import * as scrape from '~/backend/scrape'
import * as api from '~/client/api'
import * as authentication from '~/backend/authentication'
import * as queries from '~/backend/resource/queries'

//Get to work on the specified subreddit. Returns the new job, or any existing job for that subreddit.
//Null if subreddit doesn't exist
export async function scrapeSubredditFromPushshift( wetland : Wetland, subredditName : string, from_utc : Date = new Date(),  to_utc : Date = new Date(0) ) : Promise<scrape.ActiveJob>
{
    if (from_utc < to_utc)
    {
        throw new Error(`from time ${from_utc} was older than to time ${to_utc}, should be opposite.`)
    }

    let manager : Scope = wetland.getManager();

    let subreddit : entities.Subreddit = await manager.getRepository(entities.Subreddit).findOne({ name: subredditName }, {})

    if (subreddit == null)
    {
        throw new Error(`Tried to crawl pushshift for subreddit that does not exist in local database`);
    }

    let job : scrape.ActiveJob = await scrape.createJob(manager,subreddit,models.ScrapeType.PUSHSHIFT,from_utc,to_utc);

    //Let caller decide if they want to await the result
    job.promise = processScrapeJob(wetland, manager, job);

    return job;
}

function getNewUrl( subreddit : entities.Subreddit, before : number, limit : number = 500)
{
    //With raw_json=1 you get unescaped characters.
    return `https://api.pushshift.io/reddit/search/submission/?subreddit=${subreddit.name}&sort=desc&before=${before}&limit=${limit}`
}


export async function processScrapeJob(wetland : Wetland, manager : Scope, activeJob: scrape.ActiveJob)
{
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
            header: {   'User-Agent': 'RFY crawler',
                        'Content-Type': 'application/json' }
            };


        let from_utc = Math.floor( activeJob.job.scrape_from_time.getTime() / 1000 );
        let to_utc = Math.floor( activeJob.job.scrape_to_time.getTime() / 1000 );

        let pageNumber : number = 0;
        while (true)
        {
            if (from_utc == to_utc)
            {
                console.log(`Ending scrape job for ${activeJob.job.subreddit.name} because to-from values were identical`);
                break;
            }

            if (activeJob.cancelRequested)
            {
                await scrape.endJob(manager,activeJob, models.ScrapeStatus.CANCELLED);
                break;
            }

            let url = getNewUrl(activeJob.job.subreddit, from_utc,500);

            console.log("url: ",url);

            let response = await fetch(url, config);
            {
                if (response.ok)
                {
                    let result = await response.json();
                    let {last_created_utc, processed_count} = await scrape.parse.parsePostBatch(wetland, activeJob.job.subreddit, result.data, true);

                    postsProcessed += processed_count;
                    from_utc = last_created_utc;

                    activeJob.job.processed_count = postsProcessed;
                    //activeJob.job.updatedAt = new Date();
                    if (last_created_utc > 0)
                    {
                        //Empty list results in a last-post value of 0
                        activeJob.job.last_post_time = new Date(last_created_utc * 1000);
                    }
                    
                    await manager.flush();

                    if (last_created_utc < to_utc)
                    {
                        console.log(`Reached oldest post of ${last_created_utc} for ${activeJob.job.subreddit.name}, limit was ${to_utc}`);
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
                    throw new Error(`Pushshift responded with status ${response.status}: ${response.statusText} for url ${url}`)
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
        console.log(`Problem scraping pushshift: ${err}`);

        await scrape.endJob(manager,activeJob, models.ScrapeStatus.ERROR);

        throw new Error(err.message)
    }
    
}