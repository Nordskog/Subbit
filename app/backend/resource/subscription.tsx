import { Request, Response } from 'express';

import * as Express from 'express';

import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

import * as serverActions from '~/backend/actions';
import * as models from '~/common/models';

import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

import * as entityActions from '~/backend/entityActions';

import * as endpointCommons from './endpointCommons';
import { EndpointException } from '~/common/exceptions';
import { Severity } from '~/common/log';

import * as Log from '~/common/log';
import serverConfig from 'root/server_config';
import * as tools from '~/common/tools';

const router = Express.Router();

router.get('/api/subscription', async (req: Request, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;

    try
    {
        let user = await authentication.verification.getAuthorizedUser(manager, token, {}, authentication.generation.Scope.SUBSCRIPTIONS);
        
        Log.A('List subscriptions', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ));

        // Just grabbing the user and populating everything we need generates terrible, complicated with a binding for each 
        // sub. Short of doing a raw query this is generally the best approach.
        let qb : Wetland.QueryBuilder<Entities.Subscription> = RFY.wetland.getManager()
            .getRepository(Entities.Subscription)
            .getQueryBuilder('sub')
            .select( ['sub',  'subreddits', 'author'] )
            .leftJoin('sub.author', 'author')
            .leftJoin('sub.subreddits', 'subreddits')
            .where( {user_id : user.id} );

        let subs : Entities.Subscription[] = await qb.getQuery().getResult() || [];

        // Rather than looking up the user for each subscription
        subs.forEach( ( sub : Entities.Subscription ) => sub.user = user );

        res.json( subs.map( (sub) => 
        { 
            return Entities.Subscription.formatModel(sub);
        }));
        
    }
    catch (err)
    {
        endpointCommons.handleException(err, req, res, token);
    }
});

router.post('/api/subscription', async (req: Request, res: Response) =>
{   
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;
    let rawReq : models.Action<any> = req.body;

    let user: Entities.User = null;
    try
    {
        user = await authentication.verification.getAuthorizedUser(manager, token, null, authentication.generation.Scope.SUBSCRIPTIONS);
    
        switch(rawReq.type)
        {
            case serverActions.subscription.ADD_SUBSCRIPTION:
            {
                Log.A('Add subscription', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ), { payload: rawReq.payload } );

                let payload : serverActions.subscription.ADD_SUBSCRIPTION = rawReq.payload;
                let sub : Entities.Subscription = await entityActions.subscriptions.getNewSubscription( manager, user, payload.author, ...payload.subreddits );

                await manager.flush();
                res.json( Entities.Subscription.formatModel(sub) );
                
                break;
            }
            case serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT:
            {
                Log.A('Add subscription subreddit', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ), { payload: rawReq.payload } );

                let payload : serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT = rawReq.payload;
                let sub : Entities.Subscription = await entityActions.subscriptions.getSubscription(manager, payload.id, user);
                if (sub == null)
                {
                    throw new EndpointException(400, "Subscription with id " + payload.id + " does not exist", Severity.warning);
                }

                await entityActions.subscriptions.addSubredditToSubscription(manager, sub, payload.subreddit);
            
                await manager.flush();
                res.json( Entities.Subscription.formatModel(sub) );

                break;
            }
            case serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT:
            {
                Log.A('Remove subscription subreddit', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ), { payload: rawReq.payload } );

                let payload : serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT = rawReq.payload;
                let sub : Entities.Subscription = await entityActions.subscriptions.getSubscription(manager, payload.id, user);
                if (sub == null)
                {
                    throw new EndpointException(400, "Subscription with id " + payload.id + " does not exist", Severity.warning);
                }

                await entityActions.subscriptions.removeSubredditFromSubscription(manager, sub, payload.subreddit);
                await manager.flush();
                res.json( Entities.Subscription.formatModel(sub) );

                break;
            }

            case serverActions.subscription.REMOVE_SUBSCRIPTION:
            {
                Log.A('Remove subscription', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ), { payload: rawReq.payload } );

                let payload : serverActions.subscription.REMOVE_SUBSCRIPTION = rawReq.payload;
                let sub : Entities.Subscription = await entityActions.subscriptions.getSubscription(manager, payload.id, user);
                if (sub == null)
                {
                    // Likely browsing in multiple tabs with subs out of sync.
                    // Warning will be displayed to user, and sub removed locally. 
                    throw new EndpointException(400, "Subscription with id " + payload.id + " does not exist", Severity.warning);
                }

                manager.remove(sub);
                await manager.flush();

                res.status(200).json(true);

                break;
            }

            default:
            {
                throw new EndpointException(400, `Unknown action requested: ${rawReq.type}`);
            }
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, req, res, token);
    }
});

export default router;
