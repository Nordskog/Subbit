import * as Express from 'express';
import * as Entities from '~/backend/entity';

import { WetlandRequest } from '~/backend/rfy';

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
import { AuthorizationException } from '~/common/exceptions';
import { Scope } from '~/backend/authentication/generation';

import * as stats from '~/backend/stats'

const express = require('express');
const router = express.Router();

require('isomorphic-fetch');

router.get('/api/authorize_remote', (req: WetlandRequest, res: Express.Response) =>
{
    let sessionLogin : boolean = req.query.session == 'true';

    //Login via reddit
    let url = authentication.redditAuth.generateRedditLoginUrl(sessionLogin ? models.auth.LoginType.SESSION : models.auth.LoginType.PERMANENT);
    res.redirect(url); 
});

router.get('/api/authorize_refresh', async (req: WetlandRequest, res: Express.Response) =>
{
    let token : string = req.headers.access_token as string;

    let manager : Wetland.Scope = RFY.wetland.getManager()

    try
    {
        let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: 'auth' }, Scope.REDDIT);

        //The client side will refresh the token if it will expire within 5min.
        //Return stored token if valid for longer than 5min.
        if (user.auth.expiry < new Date( Date.now() + ( 1000 * 60 * 5 ) ))
        {
            //Refresh token
            let result = await api.reddit.auth.authenticatedWithRefreshToken( user.auth.refresh_token, redditAuth.getHttpBasicAuthHeader() );
            if (result == null || result.access_token == null)
            {
                throw new AuthorizationException("Reddit refused token refresh. Please try logging out and back in");
            }
    
            user = await redditAuth.createOrUpdateUserFromRedditToken(manager, result, user);
        }
        else
        {
            //Existing token still valid for at least 5min, return that.
        }

        //Reusing existing login type on refresh
        let existingAccessToken : models.auth.AccessToken = await authentication.verification.getDecodedTokenWithoutVerifying(token);
        let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user, existingAccessToken.loginType);

        res.json( userInfo.redditAuth );
        return;
    }
    catch (err)
    {
        endpointCommons.handleException(err, res);
    } 

});


router.post('/api/authorize_local', async (req: WetlandRequest, res: Express.Response) =>
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
    
                    let result = await api.reddit.auth.authenticateWithCode(payload.code, urls.RFY_AUTHORIZE_REDIRECT, authentication.redditAuth.getHttpBasicAuthHeader() );
                    if (result == null || result.access_token == null)
                    {
                        throw new AuthorizationException("Did not receive authorization response from reddit");
                    }
    
                    let manager : Wetland.Scope = RFY.wetland.getManager()
                    let user : Entities.User = await redditAuth.createOrUpdateUserFromRedditToken(manager,result);
    
                    let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user, loginType);
    
                    console.log("Logging in: ", user.username);
                    res.json( userInfo );
    
                    stats.add(stats.StatsCategoryType.SUCCESSFUL_LOGINS);
    
                    return;
                }
                catch ( err )
                {
                    stats.add(stats.StatsCategoryType.FAILED_LOGINS);
                    throw err;
                }
            }

            case serverActions.auth.UNAUTHORIZE_ALL_DEVICES:
            {
                let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, null, Scope.LOGOUT);

                console.log("Logging out on all devices: ", user.username);

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
        endpointCommons.handleException(err, res);
    }
});

module.exports = router;