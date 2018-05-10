import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';



import * as entities from '~/backend/entity';

import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'

import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';
import * as RFY from '~/backend/rfy';
import * as Knex from 'knex';

import * as scrape from '~/backend/scrape'
import * as queries from './queries'
import * as config from '~/config'

import * as tools from '~/common/tools'

import { AuthorFilter } from '~/common/models';

const express = require('express');
const router = express.Router();

//Return data on individual jobs
router.get('/api/scrape', async (req: WetlandRequest, res: Response) =>
{
    try
    {
        let job_id = req.query.id;
        let after = req.query.after;    //Updated after
        let manager : Wetland.Scope = RFY.wetland.getManager();

        let job : entities.ScrapeJob = null;

        //Prioritize job_id
        if (job_id != null)
        {
            job = await manager.getRepository(entities.ScrapeJob).findOne( { id : job_id }, {populate:'subreddit'} );

            res.json( entities.ScrapeJob.formatModel(job) );
        }
        else if (after != null)
        {
            let jobs : entities.ScrapeJob[] = await manager.getRepository(entities.ScrapeJob).getQueryBuilder('job')
                                                        .select(['job', 'sub.id', 'sub.name', 'sub.autoscrape'])
                                                        .innerJoin('job.subreddit', 'sub')
                                                        .where( { updatedAt: { 'gt' : new Date(after * 1000) } } )
                                                        .getQuery().getResult() || [];

            res.json( jobs.map( job  => entities.ScrapeJob.formatModel(job) ) );
        }
        else
        {
            if (job == null)
            {
                throw new Error("No matching jobs");
            }
        }


    }
    catch (err)
    {
        console.log("Failed to get job: ",err);
        res.status(500).json( err.message );
    }
});


router.post('/api/scrape', async (req: WetlandRequest, res: Response) =>
{
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;   

    try
    {
        switch(rawReq.type)
        {
            case serverActions.scrape.REQUEST_SCRAPE:
            {
                let rawReq : models.Action< serverActions.scrape.REQUEST_SCRAPE > = req.body;

                if (rawReq.payload.subreddit == null)
                {
                    throw new Error("Subreddit not specified");
                }

                /*
                switch(rawReq.payload.scrape_type)
                {
                    case models.ScrapeType.PUSHSHIFT:
                    {
                        if (rawReq.payload.scrape_from_time == null || rawReq.payload.scrape_to_time == null)
                        {
                            throw new Error("Time range was not specified");
                        }

                            
                        let job : scrape.ActiveJob = await scrape.scrapeSubreddit( 
                                                                        RFY.wetland, 
                                                                        rawReq.payload.subreddit, 
                                                                        models.ScrapeType.PUSHSHIFT,
                                                                        new Date( rawReq.payload.scrape_to_time * 1000 ),
                                                                        new Date( rawReq.payload.scrape_from_time * 1000 ),
                                                                    ) ;   
        
                        //TODO return job info
                        res.json( entities.ScrapeJob.formatModel(job.job) ); 
                        break;
                    }
                    case models.ScrapeType.REDDIT:
                    {
                        
                        let job : scrape.ActiveJob = await scrape.scrapeSubreddit( RFY.wetland, 
                                                    rawReq.payload.subreddit,
                                                    models.ScrapeType.REDDIT,
                                                    rawReq.payload.scrape_to_time != null ? new Date( rawReq.payload.scrape_to_time * 1000 ) : new Date(0) );  

                        res.json( entities.ScrapeJob.formatModel(job.job) ); 

                        break;
                    }
                }
                */
                break;
            }

            case serverActions.scrape.CANCEL_SCRAPE:
            {
                let rawReq : models.Action< serverActions.scrape.CANCEL_SCRAPE > = req.body;

                scrape.requestJobCancel(rawReq.payload.id);
                res.json(true);
                break;
            }

            case serverActions.scrape.SET_AUTOSCRAPE:
            {
                let rawReq : models.Action< serverActions.scrape.SET_AUTOSCRAPE > = req.body;

                scrape.scrapeBot.updateScrapeBotState(rawReq.payload.enabled);
                res.json( scrape.scrapeBot.getState() );
                break;
            }

            case serverActions.scrape.SET_AUTOSCRAPE_INTERVAL:
            {
                let rawReq : models.Action< serverActions.scrape.SET_AUTOSCRAPE_INTERVAL > = req.body;
                scrape.scrapeBot.updateScrapeBotInterval(rawReq.payload.interval);
                res.json( scrape.scrapeBot.getState() );
                break;
            }

            case serverActions.scrape.SET_AUTOSCRAPE_CONCURRENT_REQUESTS:
            {
                let rawReq : models.Action< serverActions.scrape.SET_AUTOSCRAPE_CONCURRENT_REQUESTS > = req.body;
                scrape.scrapeBot.updateScrapeBotConcurrentRequests(rawReq.payload.concurrent_requests);
                res.json( scrape.scrapeBot.getState() );
                break;
            }

            case serverActions.scrape.RUN_AUTOSCRAPE_NOW:
            {
                scrape.scrapeBot.scrapeNow();
                res.json( true );
                break;
            }

            default:
            {
                throw new Error(`Unknown action requested: ${rawReq.type}`);
            }
        }
    }
    catch (err)
    {
        console.log("Problem in scrape api: ",err);
        res.status(500).json( err.message );
    }
});


module.exports = router;