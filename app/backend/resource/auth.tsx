
import { Request, Response } from 'express';
import * as Express from 'express';
import * as Entities from '~/backend/entity';

import * as Wetland from 'wetland';
import * as RFY from '~/backend/rfy';

import * as models from '~/common/models';
import * as actions from '~/client/actions';
import * as authentication from '~/backend/authentication';
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import * as api from '~/common/api'

import * as serverActions from '~/backend/actions'

import * as redditAuth from '~/backend/authentication/redditAuth'

import * as endpointCommons from './endpointCommons'
import { AuthorizationException, EndpointException } from '~/common/exceptions';
import { Scope } from '~/backend/authentication/generation';
import * as Log from '~/common/log';

import serverConfig from 'root/server_config'

import * as stats from '~/backend/stats'

const router = Express.Router();

require('isomorphic-fetch');

router.get('/api/authorize_remote', (req: Request, res: Response) =>
{
    let sessionLogin : boolean = req.query.session === 'true';
    let compactLogin : boolean = req.query.compact === 'true';

    Log.A('Reddit login redirect', null, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

    //Login via reddit
    let url = authentication.redditAuth.generateRedditLoginUrl(sessionLogin ? models.auth.LoginType.SESSION : models.auth.LoginType.PERMANENT, compactLogin);

    res.redirect(url); 
});

router.get('/api/authorize_refresh', async (req: Request, res: Response) =>
{
    let token : string = req.headers.access_token as string;

    let manager : Wetland.Scope = RFY.wetland.getManager()

    try
    {
        let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: 'auth' }, Scope.REDDIT);

        Log.A('Authorize refresh', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

        //The client side will refresh the token if it will expire within 5min.
        //Return stored token if valid for longer than 5min.
        if (user.auth.expiry < new Date( Date.now() + ( 1000 * 60 * 5 ) ))
        {
            //Refresh token
            let result = await api.reddit.auth.authenticatedWithRefreshToken( user.auth.refresh_token, redditAuth.getHttpBasicAuthHeader() );
            if (result == null || result.access_token == null)
            {
                Log.A('Authorize refresh failure', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

                throw new AuthorizationException("Reddit refused token refresh. Please try logging out and back in");
            }
    
            user = await redditAuth.createOrUpdateUserFromRedditToken(manager, result, user);
        }
        else
        {
            //Existing token still valid for at least 5min, return that.
        }

        res.json(
        {
            access_token : user.auth.access_token,
            expiry : tools.time.dateToUnix(user.auth.expiry)
        } as models.auth.RedditAuth );   
        return;
    }
    catch (err)
    {
        endpointCommons.handleException(err, req, res, token);
    } 

});


router.post('/api/authorize_local', async (req: Request, res: Response) =>
{
    let token : string = req.headers.access_token as string;
    let action : models.Action<any> = req.body;
    let manager : Wetland.Scope = RFY.wetland.getManager();

    try
    {
        switch(action.type)
        {
            case serverActions.auth.AUTHENTICATE_WITH_REDDIT_CODE:
            {
                try
                {
                    let payload : serverActions.auth.AUTHENTICATE_WITH_REDDIT_CODE = action.payload;
    
                    //Will throw if invalid
                    let loginType = authentication.redditAuth.confirmAuthState(payload.state);
    
                    //From what I've seen the code is alphanumerical + undscore and dash. Sanitize here.
                    if ( !tools.string.confirmAlphaNumericDashUnderscore(payload.code) )
                    {
                        throw new AuthorizationException( `Code from reddit should be alphanumerical, got: ${payload.code}`);
                    }

                    let result = await api.reddit.auth.authenticateWithCode(payload.code, urls.RFY_AUTHORIZE_REDIRECT, authentication.redditAuth.getHttpBasicAuthHeader() );
                    if (result == null || result.access_token == null)
                    {
                        throw new AuthorizationException("Did not receive authorization response from reddit");
                    }
    
                    let manager : Wetland.Scope = RFY.wetland.getManager()
                    let user : Entities.User = await redditAuth.createOrUpdateUserFromRedditToken(manager,result);
    
                    let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user, loginType);
    
                    res.json( userInfo );
    
                    stats.add(stats.StatsCategoryType.SUCCESSFUL_LOGINS);

                    Log.A('Login success', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );
    
                    return;
                }
                catch ( err )
                {
                    Log.A('Login failure', null, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

                    stats.add(stats.StatsCategoryType.FAILED_LOGINS);
                    throw err;
                }
            }

            case serverActions.auth.UNAUTHORIZE_ALL_DEVICES:
            {
                let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, null, Scope.LOGOUT);

                Log.A('Logout on all devices', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

                //Just needs to be different, really.
                user.generation = Math.floor(  (Date.now() / 1000) );
                manager.flush();

                res.json(true);

                return;
            }
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, req, res, token);
    }
});

export default router;