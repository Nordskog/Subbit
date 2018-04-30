import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'

import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

import * as queries from './queries'

const express = require('express');
const router = express.Router();


router.post('/api/subscription', async (req: WetlandRequest, res: Response) =>
{   
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;

    let user: Entities.User = null;
    try
    {
        user = await authentication.verification.getUserIfAuthorized(manager, token, authentication.generation.scopes.SUBSCRIPTIONS);
    }
    catch (err)
    {
        console.log("Failed to get user: ",err);
    }

    if (user == null)
    {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    switch(rawReq.type)
    {
        case serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT:
        case serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT:
        {
        
            let rawReq : models.Action< serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT > = req.body;

            let sub: Entities.Subscription = null;
            try 
            {
                sub = await manager.getRepository(Entities.Subscription).findOne({ id: rawReq.payload.id }, { populate: ['user', 'subreddits', 'author'] })
            }
            catch(err)
            {
                console.log("Error getting sub add: ", err);
                res.status(500).json({ message: "Error finding sub" });
                break;
            }

            let subreddit;
            try 
            {
                subreddit = await manager.getRepository(Entities.Subreddit).findOne({ id: rawReq.payload.subreddits[0].id }, {})
            }
            catch(err)
            {
                console.log("Error getting sub add: ", err);
                res.status(500).json({ message: "Error finding sub" });
                break;
            }

            if (subreddit == null)
            {
                console.log("Attempted to add/remove subreddit that doesn't exist from subscription: ",rawReq.payload.subreddits[0].id);
            }
            else
            {
                if (rawReq.type === serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT)
                {
                    let subbedReddits : Wetland.ArrayCollection<Entities.Subreddit> = sub.subreddits;
                    subbedReddits.add(subreddit);
                }
                else if (rawReq.type === serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT)
                {
                    let subbedReddits : Wetland.ArrayCollection<Entities.Subreddit> = sub.subreddits;
                    subbedReddits.remove(subreddit);
                }


                try
                {
                    await manager.flush();
                }
                catch (err)
                {
                    console.log("Something went wrong: " + err);
                    res.status(500).json({ message: "Error saving subscription" });
                    return; 
                }
            }

            try
            {
                let rawKnex = RFY.rawQuery();
                let result = await queries.subscription.getSubscription(rawKnex, sub.id);
                res.status(200).json( RFY.postgresJsonResult( result ) );
            }
            catch (err)
            {
                console.log("error ", err);
                res.status(500).json({ message: "db failure" });
                break;
            }


            break;
        }
        case serverActions.subscription.ADD_SUBSCRIPTION:
        {
            let rawReq : models.Action< serverActions.subscription.ADD_SUBSCRIPTION > = req.body;

            if (!authentication.verification.checkuser(rawReq.payload.user, user))
            {
                console.log("Attempted to modify sub other user");
                res.status(401).json({ message: "Unauthorized" });
                break;
            }

            let author: Entities.Author = await manager.getRepository(Entities.Author).findOne({ name: rawReq.payload.author });
    
            let newSub: Entities.Subscription = new Entities.Subscription;   
            manager.persist(newSub);
    
            newSub.user_id = user.id;
            newSub.author_id = author.id;
            newSub.subreddits = new Wetland.ArrayCollection();
    
            //Get all subreddits
            let subreddits : Entities.Subreddit[] = await manager.getRepository(Entities.Subreddit).find();
            subreddits.forEach( (subreddit : Entities.Subreddit ) => 
            {
                newSub.subreddits.add(  subreddit );
            })
    
            manager.persist(newSub);
            try
            {
                await manager.flush();
            }
            catch (err)
            {
                console.log("Something went wrong: " + err);
                res.status(500).json({ message: "Error saving subscription" });
                return; 
            }
    
            let rawKnex = RFY.rawQuery();
            let result = await queries.subscription.getSubscription(rawKnex,newSub.id);
            res.json( RFY.postgresJsonResult( result ) );

            break;
        }

        case serverActions.subscription.REMOVE_SUBSCRIPTION:
        {
            let rawReq : models.Action< serverActions.subscription.REMOVE_SUBSCRIPTION > = req.body;

            let sub: Entities.Subscription = null;
            try 
            {
                sub = await manager.getRepository(Entities.Subscription).findOne({ id: rawReq.payload.id }, { populate: 'user' })
            }
            catch(err)
            {
                console.log("Error getting sub: ", err);
                res.status(500).json({ message: "Error finding sub" });
                break;
            }

            if (sub == null)
            {
                console.log("couldn't find sub");
                res.status(401).json({ message: "Unauthorized" });
                break;
            }

            manager.remove(sub);
            try
            {
                await manager.flush();
            }
            catch(err)
            {
                console.log("Something went wrong: " + err);
                res.status(500).json({ message: "Failed to save" });
                break;
            }

            res.status(200).json({ message: "Success" });

            break;
        }

    }

});

module.exports = router;