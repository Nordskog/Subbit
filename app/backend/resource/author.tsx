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

import * as serverActions from '~/backend/actions'

import { AuthorFilter } from '~/common/models';
import { getAuthorsInSubreddit } from '~/backend/resource/queries/author';

const express = require('express');
const router = express.Router();


//All results returned as an array
//Request params
//filter        : SUB or ALL
//username      : subscriptions for user
//page          : page number
//subreddit     : subreddit
//subscription  : single subscription
router.get('/api/authors', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();

    let token = req.headers.access_token;

    let filter : AuthorFilter = req.query.filter;
    let page : number = (req.query.page) ? req.query.page : 0;
    let subreddit : string = req.query.subreddit;
    let subscription : number = req.query.subscription;
    let author : string =  req.query.author;

    //Different path
    let singleResult = subscription != null || author != null;

    let loggedInUser = null;

    try
    {
        loggedInUser = await authentication.verification.getUserIfAuthorized(manager, token, authentication.generation.scopes.SUBSCRIPTIONS);
    }
    catch (err)
    {
        console.log("couldn't get logged in user", err);
    }

    let subscriptionForUserId = loggedInUser ? loggedInUser.id : 0;

    let rawKnex = RFY.rawQuery();
    let query;
    if (singleResult)   //Single result
    {
        if (subscription != null) //Sub
        {
            //Default filter is usually all, but for a subscription it makes more sense to only display subscribed posts by default
            query = () => queries.author.getSubscription(   rawKnex, 
                                                            subscription, 
                                                            ( filter==AuthorFilter.NEW || filter==AuthorFilter.HOT  ), 
                                                            false);
        }
        else if (author != null)   //Author
        {
            query = () => queries.author.getAuthor(rawKnex, author, subreddit, subscriptionForUserId, false);
        }
    }
    else    //Multiple results
    {
        let subscribedToByUser = 0;
        if (filter === AuthorFilter.SUBSCRIPTIONS)
        {
            subscribedToByUser = loggedInUser ? loggedInUser.id : 0;
        }

        if (subreddit != null)  //Filter by subreddit, and subscribedToByUser if not 0
        {
            query = () => queries.author.getAuthorsInSubreddit( rawKnex,
                                                                subreddit,
                                                                subscribedToByUser,
                                                                subscriptionForUserId,
                                                                false, 
                                                                filter == AuthorFilter.HOT,
                                                                config.authorDisplayCount,
                                                                page);
        }
        else    
        {
            if (subscribedToByUser == 0)    //Get all authors
                query = () => queries.author.getAuthors(    rawKnex, 
                                                            subscriptionForUserId, 
                                                            false, 
                                                            filter == AuthorFilter.HOT,
                                                            config.authorDisplayCount, 
                                                            page);
            else                        //Get subscribed authors
                query = () => queries.author.getSubscribedAuthors(  rawKnex,
                                                                    subscribedToByUser, 
                                                                    subscriptionForUserId, 
                                                                    false, 
                                                                    config.authorDisplayCount, 
                                                                    page);
        }
    }

    try
    {
        let result = await query();
        res.json( RFY.postgresJsonResult(result) || []);
    }
    catch (err)
    {
        console.log("Error getting authors", err);
        error => res.status(500).json({ error: error });
    }
});

router.get('/api/authors/search', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();

    let author : string = req.query.author;
    let subreddit : string = req.query.subreddit;

    if (author == null)
    {
        res.json([]);
        return;
    }

    try
    {
        let builder : Wetland.QueryBuilder<entities.Author> = manager.getRepository(entities.Author).getQueryBuilder('author')
                                            .select(['author.name', 'author.id']);

        if (subreddit != null)
        {
            builder = builder
            .leftJoin( 'author.in_subreddit', 'inSubreddit')
            .innerJoin('inSubreddit.subreddit', 'sub')
            .where( { 'author.name_lower' : { startsWith: author.toLowerCase() },'sub.name_lower' : subreddit.toLowerCase() } )
        }
        else
        {
            builder = builder
            .where( { 'author.name_lower' : { startsWith: author.toLowerCase() } } )
        }
                    
        let authors : entities.Author[] = await builder 
                                                        .orderBy( 'author.name', 'desc')
                                                        .limit(10)
                                                        .getQuery().getResult() || [];

        res.json( authors || []);
    }
    catch (err)
    {
        console.log("Error getting authors", err);
        error => res.status(500).json({ error: error });
    }

});

router.post('/api/authors', async (req: WetlandRequest, res: Response) =>
{
    let token = req.headers.access_token;
    let rawReq : models.Action< any > = req.body;

    try
    {
        switch(rawReq.type)
        {
            case serverActions.author.UPDATE_AUTHOR_HOT_SCORE_FROM_POSTS:
            {
                console.log("Updating author hot scores from posts");
                let rawReq : models.Action< serverActions.author.UPDATE_AUTHOR_HOT_SCORE_FROM_POSTS > = req.body;

                let untilDate;
                if (rawReq.payload.until != null)
                    untilDate = new Date(rawReq.payload.until);

                await queries.author.updateSubredditAuthorHotScore(RFY.rawQuery(),null,rawReq.payload.subreddit_id, untilDate);

                res.json(true);
                break;
            }

            case serverActions.author.PRUNE_AUTHORS_WITH_NO_POSTS:
            {
                console.log("Pruning authors with no posts");
                let rawReq : models.Action< serverActions.author.PRUNE_AUTHORS_WITH_NO_POSTS > = req.body;

                await queries.author.pruneAuthorsWithNoPosts(RFY.rawQuery());

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
        console.log("Problem in authors: ",err);
        res.status(500).json( err.message );
    }
});

module.exports = router;