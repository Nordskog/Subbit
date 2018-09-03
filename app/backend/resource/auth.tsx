
import { Request, Response } from 'express';
import * as Express from 'express';
import * as Entities from '~/backend/entity';

import * as Wetland from 'wetland';
import * as RFY from '~/backend/rfy';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';
import * as urls from '~/common/urls';
import * as tools from '~/common/tools';
import * as api from '~/common/api';
import * as entityActions from '~/backend/entityActions';

import * as serverActions from '~/backend/actions';

import * as redditAuth from '~/backend/authentication/redditAuth';

import * as endpointCommons from './endpointCommons';
import { AuthorizationException, EndpointException } from '~/common/exceptions';
import { Scope } from '~/backend/authentication/generation';
import * as Log from '~/common/log';

import serverConfig from 'root/server_config';

import * as stats from '~/backend/stats';
import config from 'root/config';
import { LoginType } from '~/common/models/auth';

const router = Express.Router();

router.get('/api/authorize_remote', (req: Request, res: Response) =>
{
    // Will redirect to home if login is disabled
    let url : string = config.server.server_address;

    try
    {
        Log.A('Reddit login redirect', null, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

        if ( config.common.loginEnabled )
        {
            let loginType : LoginType = req.query.type;
            let compactLogin : boolean = req.query.compact === 'true';

            if ( 
                loginType !== LoginType.PERMANENT && 
                loginType !== LoginType.SESSION &&
                loginType !== LoginType.REDDIT_ADDITIONAL_AUTH )
            {
                throw new EndpointException(400, "Invalid LoginType: " + loginType);
            }
        
            // Login via reddit
            url = authentication.redditAuth.generateRedditLoginUrl(loginType, compactLogin);
        }
    
        res.redirect(url); 
    }
    catch ( err )
    {
        endpointCommons.handleException(err, req, res);
    }



});

router.get('/api/authorize_refresh', async (req: Request, res: Response) =>
{
    let token : string = req.headers.access_token as string;

    let manager : Wetland.Scope = RFY.wetland.getManager();

    try
    {
        let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: 'auth' }, Scope.REDDIT);

        Log.A('Authorize refresh', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

        // The client side will refresh the token if it will expire within 5min.
        // Return stored token if valid for longer than 5min.
        if (user.auth.expiry < new Date( Date.now() + ( 1000 * 60 * 5 ) ))
        {
            // Refresh token
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
            // Existing token still valid for at least 5min, return that.
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
    
                    ///////////////////////////
                    // Confirm valid data 
                    /////////////////////////////

                    // From what I've seen the code is alphanumerical + undscore and dash. Sanitize here.
                    if ( !tools.string.confirmAlphaNumericDashUnderscore(payload.code) )
                    {
                        throw new AuthorizationException( `Code from reddit should be alphanumerical, got: ${payload.code}`);
                    }

                    // Will throw if invalid
                    let loginType = authentication.redditAuth.confirmAuthState(payload.state);
                    
                    ////////////////////////////////////
                    // Handle login & temporary token
                    ////////////////////////////////////

                    let manager : Wetland.Scope = RFY.wetland.getManager();

                    if (loginType === LoginType.REDDIT_ADDITIONAL_AUTH)
                    {
                        ///////////////////////////
                        // Temporary token
                        ///////////////////////////

                        // Must come with existing access token
                        let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, null, Scope.REDDIT);

                        let result = await api.reddit.auth.authenticateWithCode(payload.code, urls.RFY_AUTHORIZE_REDIRECT, authentication.redditAuth.getHttpBasicAuthHeader() );
                        if (result == null || result.access_token == null)
                        {
                            throw new AuthorizationException("Did not receive authorization response from reddit");
                        }

                        await redditAuth.updateUserAdditionalAuth(manager,result, user);

                        // We'll borrow the login type used to generate the original access token
                        let originalLoginType = ( await authentication.verification.getDecodedTokenWithoutVerifying(token) ).login_type;

                        let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user, originalLoginType);
                        res.json( userInfo );

                        stats.add(stats.StatsCategoryType.SUCCESSFUL_LOGINS);
                        Log.A('Additional login success', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );
                    }
                    else
                    {
                        /////////////////////////
                        // Login
                        ////////////////////////

                        let result = await api.reddit.auth.authenticateWithCode(payload.code, urls.RFY_AUTHORIZE_REDIRECT, authentication.redditAuth.getHttpBasicAuthHeader() );
                        if (result == null || result.access_token == null)
                        {
                            throw new AuthorizationException("Did not receive authorization response from reddit");
                        }
        
                        let user : Entities.User = await redditAuth.createOrUpdateUserFromRedditToken(manager,result);
                        let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user, loginType);
        
                        res.json( userInfo );
        
                        stats.add(stats.StatsCategoryType.SUCCESSFUL_LOGINS);
                        Log.A('Login success', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );
                    }

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

                entityActions.auth.nukeGeneration(user);
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
