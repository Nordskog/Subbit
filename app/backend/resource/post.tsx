import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as entities from '~/backend/entity';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';
import * as RFY from '~/backend/rfy';
import * as Knex from 'knex';

import * as scrape from '~/backend/scrape'
import * as queries from './queries'
import * as config from '~/config'

import * as tools from '~/common/tools'

import * as request from '~/backend/actions';

import * as viewFilters from '~/common/viewFilters';

import * as serverActions from '~/backend/actions'

const express = require('express');
const router = express.Router();


router.get('/api/posts', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();

    let token = req.headers.access_token;

    let filter = req.query.filter;
    let offset : number = (req.query.offset) ? req.query.offset : 0;
    let count : number = (req.query.page) ? req.query.page : 25;
    let subreddit : string = req.query.subreddit;
    let author : number =  req.query.author;

    let loggedInUser = null;

    try
    {
        loggedInUser = await authentication.verification.getUserIfAuthorized(manager, token, authentication.generation.scopes.SUBSCRIPTIONS);
    }
    catch (err)
    {
        
    }

    //Filter posts by subscriptions
    let subscribedToByUser = loggedInUser ? loggedInUser.id : 0;

    if (filter == viewFilters.authorFilter.SUBSCRIPTIONS)
    {
        if (loggedInUser == null)
        {
            //Force switch to all if not logged in
            filter = viewFilters.authorFilter.ALL;
        }
    }



    let rawKnex = RFY.rawQuery();
    let query;
    {
       
        if (subreddit != null)  //Filter by subreddit, and subscribedToByUser if not 0
        {
            
            query = () => queries.post.getPostsForAuthorInSubreddit( rawKnex,
                                                                    author,
                                                                    subreddit,
                                                                    count,
                                                                    offset
                                                            );
        }
        else    
        {
            
            if (filter == viewFilters.authorFilter.SUBSCRIPTIONS)
            {
                    
                    query = () => queries.post.getPostsForSubscribedAuthor( rawKnex,
                        author,
                        subscribedToByUser,
                        count,
                        offset
                );
            }
            else
            {       
                    query = () => queries.post.getPostsForAuthor( rawKnex,
                        author,
                        count,
                        offset
                );
            }

        }
    }

    try
    {
        let result = await query();
        res.json( RFY.postgresJsonResult(result) || []);
    }
    catch (err)
    {
        console.log("Error getting posts", err);
        error => res.status(500).json({ error: error });
    }
});

router.post('/api/posts', async (req: WetlandRequest, res: Response) =>
{
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;   

    try
    {
        switch(rawReq.type)
        {
            case serverActions.post.UPDATE_POST_HOT_SCORE:
            {
                console.log("Updating post hot scores");
                let rawReq : models.Action< serverActions.post.UPDATE_POST_HOT_SCORE > = req.body;

                let untilDate;
                if (rawReq.payload.until != null)
                    untilDate = new Date(rawReq.payload.until);

                await queries.post.updateHotScore(RFY.rawQuery(),null,rawReq.payload.subreddit_id, untilDate);

                res.json(true);
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