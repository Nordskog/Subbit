import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as RFY from '~/backend/rfy';
import * as entities from '~/backend/entity';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

import * as serverActions from '~/backend/actions'

import * as entityActions from '~/backend/entityActions'

const express = require('express');
const router = express.Router();

//Set current 
router.get('/api/user/last_visit', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;

    if (token)
    {
        try
        {
            let user : entities.User = await authentication.verification.getUserIfAuthorized(manager, token);
            if (user)
            {
                let prevDate = ( (<Date>user.last_visit).getTime() / 1000 );
                let currentDate = Date.now() / 1000;

                //Always return last visit
                res.json( prevDate );

                //Only update if more than 5min ago
                if ( (currentDate - prevDate) > 60 * 5 )
                {
                    user.last_visit = new Date();
                    await manager.flush().catch((err: Error) =>
                    {
                        console.log("Something went wrong: " + err);
                    });
                }

                return;
            }
        }
        catch (e)
        {
            console.log("fuckup", e);
        }
    }

    res.json( 0 );
});

router.get('/api/user/settings', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;

    try
    {
        if (token)
        {
            let user : entities.User = await authentication.verification.getUserIfAuthorized(manager, token, { populate: "settings" });
            if (user)
            {
                //Always return last visit
                res.json( entities.UserSettings.formatModel(user.settings) );
                return;
            }
            else
            {
                res.status(403).json( "Unauthorized or user not found" );
            }
        }
    }
    catch (err)
    {
        console.log("Failed to edit subscription: ",err);
        res.status(500).json("Something went wrong");
    }

});


router.post('/api/user', async (req: WetlandRequest, res: Response) =>
{   
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;

    let user: entities.User = null;
    try
    {
        user = await authentication.verification.getUserIfAuthorized(manager, token, { populate: "settings" }, authentication.generation.scopes.SUBSCRIPTIONS);
        if (user == null)
        {
            throw new Error(`Unauthorized or user doesn't exist`);
        }
    
        switch(rawReq.type)
        {
            case serverActions.user.SET_SETTING_POST_DISPLAY_MODE:
            {
                let payload : serverActions.user.SET_SETTING_POST_DISPLAY_MODE = rawReq.payload;
                entityActions.user.setPostDisplayMode(manager, user, payload.mode);
                await manager.flush();
                res.json( true );
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
        console.log("Failed to edit subscription: ",err);
        res.status(500).json("Something went wrong");
    }
});


module.exports = router;