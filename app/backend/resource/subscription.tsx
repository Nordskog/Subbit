import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as RFY from '~/backend/rfy';
import * as entities from '~/backend/entity';

import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'

import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

import * as queries from './queries'

import * as Knex from 'knex';
import { subreddit } from 'css/manager.scss';

import * as entityActions from '~/backend/entityActions'

const express = require('express');
const router = express.Router();

router.get('/api/subscription', async (req: WetlandRequest, res: Response) =>
{

    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;

    try
    {
        let user = await authentication.verification.getUserIfAuthorized(manager, token, {}, authentication.generation.scopes.SUBSCRIPTIONS);

        if (user != null)
        {
            //Just grabbing the user and populating everything we need generates terrible, complicated with a binding for each 
            //sub. Short of doing a raw query this is generally the best approach.
            let qb : Wetland.QueryBuilder<entities.Subscription> = RFY.wetland.getManager()
            .getRepository(entities.Subscription)
            .getQueryBuilder('sub')
            .select( ['sub',  'subreddits', 'author'] )
            .leftJoin('sub.author', 'author')
            .leftJoin('sub.subreddits', 'subreddits')
            .where( {'user_id' : user.id} )

            let subs : entities.Subscription[] = await qb.getQuery().getResult() || [];

            //Rather than looking up the user for each subscription
            subs.forEach( ( sub : entities.Subscription ) => sub.user = user );

            res.json( subs.map( sub => { 
            return entities.Subscription.formatModel(sub);
            } ));
        }
    }
    catch (err)
    {
        console.log("Failed to get subscriptions: ",err);
        res.status(500).json("Something went wrong");
    }
});

router.post('/api/subscription', async (req: WetlandRequest, res: Response) =>
{   
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;

    let user: entities.User = null;
    try
    {
        user = await authentication.verification.getUserIfAuthorized(manager, token, authentication.generation.scopes.SUBSCRIPTIONS);
    
        switch(rawReq.type)
        {
            case serverActions.subscription.ADD_SUBSCRIPTION:
            {
                let payload : serverActions.subscription.ADD_SUBSCRIPTION = rawReq.payload;

                let sub : entities.Subscription = await entityActions.subscriptions.getNewSubscription( manager, user, payload.author, payload.subreddit );

                await manager.flush();
                res.json( entities.Subscription.formatModel(sub) );
                
                break;
            }
            case serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT:
            {
                let payload : serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT = rawReq.payload;

                let sub : entities.Subscription = await entityActions.subscriptions.getSubscription(manager, payload.id, user);
                await entityActions.subscriptions.addSubredditToSubscription(manager, sub, payload.subreddit);
            
                await manager.flush();
                res.json( entities.Subscription.formatModel(sub) );

                break;
            }
            case serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT:
            {
                let payload : serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT = rawReq.payload;
                let sub : entities.Subscription = await entityActions.subscriptions.getSubscription(manager, payload.id, user);

                await entityActions.subscriptions.removeSubredditFromSubscription(manager, sub, payload.subreddit);
                await manager.flush();
                res.json( entities.Subscription.formatModel(sub) );

                break;
            }

            case serverActions.subscription.REMOVE_SUBSCRIPTION:
            {
                let payload : serverActions.subscription.REMOVE_SUBSCRIPTION = rawReq.payload;
                let sub : entities.Subscription = await entityActions.subscriptions.getSubscription(manager, payload.id, user);

                manager.remove(sub);
                await manager.flush();

                res.status(200).json(true);

                break;
            }
        }
    }
    catch (err)
    {
        console.log("Failed to edit subscription: ",err);
        res.status(500).json("Something went wrong");
    }
});

module.exports = router;