import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';
import * as Wetland from 'wetland';

const express = require('express');
const router = express.Router();

import * as RFY from '~/backend/rfy';
import * as queries from './queries'
import * as entities from '~/backend/entity'
import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'


router.get('/api/subreddits', async (req: WetlandRequest, res: Response) =>
{
    try
    {
        let includeScrapeJob  : boolean = req.query.scrape_job;

        let qb : Wetland.QueryBuilder<entities.Subreddit> = RFY.wetland.getManager()
            .getRepository(entities.Subreddit)
            .getQueryBuilder('sub')

        if (includeScrapeJob)
        {
            qb = qb .select(['sub', 'job'])
                    .leftJoin('sub.scrape_job', 'job');
        }
        else
        {
            qb.select('sub');
        }
    
        let subreddits : entities.Subreddit[] = await qb.orderBy('name', 'asc')
                                                        .getQuery().getResult() || [];

        res.json( subreddits.map( subreddit => { 
            return entities.Subreddit.formatModel(subreddit);
        } ));
    }
    catch (err)
    {
        console.log("Failed to get subreddits: ",err);
        res.status(500).json("Something went wrong");
    }
});

router.post('/api/subreddits', async (req: WetlandRequest, res: Response) =>
{
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;
    let manager : Wetland.Scope = RFY.wetland.getManager();

    try
    {
        switch(rawReq.type)
        {
            case serverActions.subreddit.ADD_SUBREDDIT:
            {
                let rawReq : models.Action< serverActions.subreddit.ADD_SUBREDDIT > = req.body;

                let subreddit = await manager.getRepository(entities.Subreddit).findOne({name: rawReq.payload.subreddit.toLowerCase() })
                if (subreddit != null)
                {
                    //Shouldn't already exist
                    throw new Error(`Subreddit ${rawReq.payload.subreddit} already exists`);
                }

                //Otherwise create new
                subreddit = new entities.Subreddit();
                subreddit.name = rawReq.payload.subreddit.toLowerCase();
                subreddit.autoscrape = false;
                subreddit.scrape_job = new entities.ScrapeJob();
                subreddit.scrape_job.job_type = models.ScrapeType.REDDIT;

                manager.persist(subreddit.scrape_job);
                manager.persist(subreddit);
                await manager.flush();

                res.json( entities.Subreddit.formatModel(subreddit) );

                break;
            }

            case serverActions.subreddit.REMOVE_SUBREDDIT:
            {
                let rawReq : models.Action< serverActions.subreddit.REMOVE_SUBREDDIT > = req.body;

                let subreddit = await manager.getRepository(entities.Subreddit).findOne({id: rawReq.payload.id})
                if (subreddit == null)
                {
                    //Should exist
                    throw new Error(`Subreddit ${rawReq.payload.id} doesn't exists`);
                }
                manager.remove(subreddit);
                await manager.flush();

                res.json(true);

                break;
            }

            case serverActions.subreddit.SET_AUTO_SCRAPE_STATE:
            {
                let rawReq : models.Action< serverActions.subreddit.SET_AUTO_SCRAPE_STATE > = req.body;

                let subreddit = await manager.getRepository(entities.Subreddit).findOne({id: rawReq.payload.id})
                if (subreddit == null)
                {
                    //Should exist
                    throw new Error(`Subreddit ${rawReq.payload.id} doesn't exists`);
                }
                subreddit.autoscrape = rawReq.payload.enabled;
                await manager.flush();

                res.json(true);

                break;
            }

        }
    }
    catch (err)
    {
        console.log("Problem in subreddit api: ",err);
        res.status(500).json( err.message );
    }


});

module.exports = router;