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

const express = require('express');
const router = express.Router();

require('isomorphic-fetch');

router.get('/api/authorize_remote', (req: WetlandRequest, res: Express.Response) =>
{
    //Login via reddit
    let url = authentication.redditAuth.generateRedditLoginUrl();
    res.redirect(url); 
});

router.get('/api/authorize_refresh', async (req: WetlandRequest, res: Express.Response) =>
{
    let token = req.headers.access_token;
    let username = req.query.user;

    let manager : Wetland.Scope = RFY.wetland.getManager()

    try
    {
        let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, username);

        let result = await api.reddit.auth.authenticatedWithRefreshToken( user.auth.refresh_token, redditAuth.getHttpBasicAuthHeader() );
        if (result == null || result.access_token == null)
        {
            throw new AuthorizationException("Did not receive authorization response from reddit");
        }

        user = await redditAuth.createOrUpdateUserFromRedditToken(manager, result, user);

        let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user);

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
    let token = req.headers.access_token;
    let action : models.Action<any> = req.body;
    let manager : Wetland.Scope = RFY.wetland.getManager();

    try
    {
        switch(action.type)
        {
            case serverActions.auth.AUTHENTICATE_WITH_REDDIT_CODE:
            {
                let payload : serverActions.auth.AUTHENTICATE_WITH_REDDIT_CODE = action.payload;
    
                if ( !authentication.redditAuth.confirmAuthState(payload.state) )   
                {
                    throw new AuthorizationException("Authorization state invalid");
                }

                let result = await api.reddit.auth.authenticateWithCode(payload.code, urls.RFY_AUTHORIZE_REDIRECT, authentication.redditAuth.getHttpBasicAuthHeader() );
                if (result == null || result.access_token == null)
                {
                    throw new AuthorizationException("Did not receive authorization response from reddit");
                }

                let manager : Wetland.Scope = RFY.wetland.getManager()
                let user : Entities.User = await redditAuth.createOrUpdateUserFromRedditToken(manager,result);

                let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user);

                console.log("Logging in: ", user.username);
                res.json( userInfo );

                return;
            }
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, res);
    }


});


/*
router.get('/api/authorize_local', async (req: WetlandRequest, res: Express.Response) =>
{
    //Handle response from reddit
    let error = req.query.error;

    try
    {
        if (error)
        {
            throw new AuthorizationException("Reddit rejected authorization request: "+error);
        }
        else
        {
            let state = req.query.state;

            let result = null;

            if (  !authentication.redditAuth.confirmAuthState(state) )
            {
                throw new AuthorizationException("Authorization state invalid");
            }

            let code = req.query.code;
            result = await api.reddit.auth.authenticateWithCode(code, urls.RFY_AUTHORIZE_LOCAL, authentication.redditAuth.getHttpBasicAuthHeader() );

            if (result == null || result.access_token == null)
            {
                throw new AuthorizationException("Did not receive authorization response from reddit");
            }

            let manager : Wetland.Scope = RFY.wetland.getManager()
            let user : Entities.User = await redditAuth.createOrUpdateUserFromRedditToken(manager,result);

            console.log("Logging in: ", user.username);

            //Set infinity cookie
            let options = {
                maxAge: 1000 * 60 * 99999,
                httpOnly: true,
            };

            res.redirect( urls.RFY_URL);
        }
    }
    catch ( err)
    {
        endpointCommons.handleException(err, res);
    }
});

*/


module.exports = router;