import * as entities from '~/backend/entity'
import * as scrape from '~/backend/scrape'
import * as Wetland from 'wetland';
import * as models from '~/common/models'
import * as RFY from '~/backend/rfy'

const activeJobs : Map<number, ActiveJob> = new Map<number, ActiveJob>();

export interface ActiveJob 
{
    job : entities.ScrapeJob;
    cancelRequested : boolean;
    promise : Promise<void>;
}

export function requestJobCancel( jobId : number)
{
    let activeJob : ActiveJob= activeJobs.get(jobId);
    if (activeJob != null)
        activeJob.cancelRequested = true;
    else
        console.log("Attempted to cancel inactive job",jobId);
}

//Returns a new job ready to be executed, or throws if subreddit already has a task running
//from us 
export async function createJob(    manager: Wetland.Scope,
                                    subreddit : entities.Subreddit, 
                                    type : models.ScrapeType, 
                                    from_utc : Date = new Date(),  
                                    to_utc : Date = new Date(0),
                                    pages? : number 
                                                                    )
                                    : Promise<ActiveJob>
{


    //Make sure an existing job isn't in progress
    let job : entities.ScrapeJob = await manager.getRepository(entities.ScrapeJob).findOne({ subreddit_id: subreddit.id }, { populate: 'subreddit' });

    if (job == null || (job.status != models.ScrapeStatus.WORKING && job.status != models.ScrapeStatus.PENDING))
    {
        if (job == null)
        {
            job = new entities.ScrapeJob();
            job = manager.attach(job, true);  //Otherwise not tracked after persist 
            manager.persist(job);
            job.subreddit = subreddit;
        }
        
        

        job.scrape_from_time = from_utc;
        job.scrape_to_time = to_utc;
        job.job_type = type;
        job.max_pages = pages;
        job.status = models.ScrapeStatus.PENDING;
        job.processed_count = 0;
        job.updatedAt = new Date();

        //Flush to database
        await manager.flush();
    }
    else
    {
        throw new Error(`New job for ${job.subreddit.name} will not be created because existing job's status is ${job.status}`);
    }

    //Add to active jobs
    let activeJob : ActiveJob = 
    {
        job : job, 
        cancelRequested : false,
        promise : null
    };

    activeJobs.set( job.id, activeJob ); 

    return activeJob;
}

export async function endJob( manager : Wetland.Scope,  activeJob : ActiveJob, status : models.ScrapeStatus)
{
    activeJobs.delete(activeJob.job.id);
    activeJob.job.status = status;
    await manager.flush();
}

//Scrape until newest existing post, with a minimum of 1 week. Score changes after this should be minimal.
export async function scrapeLatestPostsFromSubreddit( wetland : Wetland.Wetland, subredditName : string, source : models.ScrapeType )
{
        let latestPost : entities.Post[] = await wetland.getManager().getRepository(entities.Post).getQueryBuilder('post')

        .select( [ 'post' ] )
        .innerJoin('subreddit', 'subreddit')
        .where( { 'subreddit.name': subredditName } )
        .orderBy({ 'post.created_utc': 'desc' })
        .limit(1)
        .getQuery().getResult();

        //Default to past week
        let scrapeTo = new Date();
        scrapeTo.setDate( scrapeTo.getDate() - 7 ); //Rolls over

        if (latestPost.length > 0)
        {
            //Scrape to last existing post if older than one week
            if ( latestPost[0].created_utc < scrapeTo )
            scrapeTo = latestPost[0].created_utc;
        }

        return await scrapeSubreddit(wetland, subredditName, source, scrapeTo);
}

export async function scrapeSubreddit( wetland : Wetland.Wetland, subredditName : string, source : models.ScrapeType, to_utc : Date = new Date(0), from_utc : Date = new Date() )
{
    if (source == models.ScrapeType.REDDIT)
    {   
        return await scrape.reddit.scrapeSubreddit( wetland, subredditName, to_utc );
    }
    else
    {
        return await scrape.pushshift.scrapeSubredditFromPushshift( wetland, subredditName, from_utc, to_utc );
    }
}
