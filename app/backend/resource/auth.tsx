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
import * as api from '~/client/api'

import * as redditAuth from '~/backend/authentication/redditAuth'
const express = require('express');
const router = express.Router();

require('isomorphic-fetch');

router.get('/api/logout', (req: WetlandRequest, res: Express.Response) =>
{
    res.clearCookie("userinfo");
    res.json({message:"Something goes here"});
});

router.get('/api/authorize_remote', (req: WetlandRequest, res: Express.Response) =>
{
    //Login via reddit
    let url = authentication.redditAuth.generateRedditLoginUrl();
    console.log("Directing user to url: ", url);
    res.redirect(url); 
});

router.get('/api/authorize_refresh', async (req: WetlandRequest, res: Express.Response) =>
{
    let token = req.headers.access_token;
    let username = req.query.user;

    let manager : Wetland.Scope = RFY.wetland.getManager()

    if (username)
    {
        try
        {
            let user : Entities.User = await authentication.verification.getUserIfAuthorized(manager, token, username);

            console.log("user: ",user);

            if (user)
            {
                let result = await api.reddit.authenticatedWithRefreshToken( user.auth.refresh_token, redditAuth.getHttpBasicAuthHeader() );

                if (result && result.access_token)
                {
                    user = await redditAuth.createOrUpdateUserFromRedditToken(manager, result, user);

                    if (user)
                    {
                        let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user);

                        console.log("Logging in: ", user.username);

                        //Set infinity cookie
                        let options = {
                            maxAge: 1000 * 60 * 99999,
                            httpOnly: true,
                        };

                        res.cookie('userinfo', userInfo, options);

                        console.log("New auth: ",userInfo.redditAuth);

                        res.json( userInfo.redditAuth );
                        return;
                    }
                }
                else
                {
                    res.json({Message:"reddit refresh error "});
                }
            }
        }
        catch (err)
        {
            console.log("reddit refresh error: ",err);
        } 
    }

    res.status(401).json( { "message" : "fuckup" });
});

router.get('/api/authorize_local', async (req: WetlandRequest, res: Express.Response) =>
{
        //Handle response from reddit
        let error = req.query.error;

        console.log("Error: ", req.query.error);
        console.log("state: ", req.query.state);
        console.log("code: ", req.query.code);

        if (error)
        {
            console.log("Login error: ", error);
            res.json({"Login error" : error});
        }
        else
        {
            let state = req.query.state;

            let result = null;
            if ( authentication.redditAuth.confirmAuthState(state) ) 
            {
                let code = req.query.code;
                result = await api.reddit.authenticateWithCode(code, "http://127.0.0.1:8080/api/authorize_local", authentication.redditAuth.getHttpBasicAuthHeader() );

            }
            else
            {
                result = null;
                console.log("Invalid state returned from reddit auth attempt");
            }

            console.log("result: ",result);

            if (result && result.access_token)
            {

                let manager : Wetland.Scope = RFY.wetland.getManager()
                let user : Entities.User = await redditAuth.createOrUpdateUserFromRedditToken(manager,result);

                console.log("user: ",user);

                if (user)
                {
                    let userInfo : models.auth.UserInfo = authentication.generation.generateUserInfo(user);

                    console.log("Logging in: ", user.username);

                    //Set infinity cookie
                    let options = {
                        maxAge: 1000 * 60 * 99999,
                        httpOnly: true,
                    };
                    res.cookie('userinfo', userInfo, options);
                    res.redirect("http://127.0.0.1:8080");
                    return;
                }
                else
                {
                    res.json({Message:"Failed to get user"});
                    return;
                }
    
            }
            else
            {
                res.json({Message:"Login failed"});
                return;
            }
        }

});


module.exports = router;