import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as RFY from '~/backend/rfy';
import * as entities from '~/backend/entity';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

import * as serverActions from '~/backend/actions'

import * as entityActions from '~/backend/entityActions'

import * as endpointCommons from './endpointCommons'
import { EndpointException } from '~/common/exceptions';
import { scopes } from '~/backend/authentication/generation';

const express = require('express');
const router = express.Router();

//Set current 
router.get('/api/user/last_visit', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;

    try
    {
        if (token)
        {
                let user : entities.User = await authentication.verification.getAuthorizedUser(manager, token);

                    let prevDate = ( (<Date>user.last_visit).getTime() / 1000 );
                    let currentDate = Date.now() / 1000;

                    //Always return last visit
                    res.json( prevDate );

                    //Only update if more than 5min ago
                    if ( (currentDate - prevDate) > 60 * 5 )
                    {
                        user.last_visit = new Date();
                        await manager.flush();
                    }        
        }
        else
        {
            res.json(0);
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, res);
    }

});

router.get('/api/user/settings', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;

    try
    {
        if (token)
        {
            let user : entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: "settings" }, scopes.SETTINGS);
            res.json( entities.UserSettings.formatModel(user.settings) );
            return;
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, res);
    }

});


router.post('/api/user', async (req: WetlandRequest, res: Response) =>
{   
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;
    let rawReq : models.Action<any> = req.body;

    try
    {
        let user: entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: "settings" },  scopes.SETTINGS);
    
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
                throw new EndpointException(400, `Unknown action requested: ${rawReq.type}`);
            }
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, res);
    }
});


module.exports = router;