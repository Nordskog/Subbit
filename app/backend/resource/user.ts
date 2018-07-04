import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

import * as serverActions from '~/backend/actions'

import * as entityActions from '~/backend/entityActions'

import * as endpointCommons from './endpointCommons'
import { EndpointException } from '~/common/exceptions';
import { Scope } from '~/backend/authentication/generation';

import * as stats from '~/backend/stats'

const express = require('express');
const router = express.Router();

//Set current 
router.get('/api/user/last_visit', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;

    try
    {
        if (token)
        {
                    let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token);

                    stats.add(stats.StatsCategoryType.USER_PAGE_LOADS);

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

//There are currently no settings stored server side
//But if there were any, this is where you'd get them.
router.get('/api/user/settings', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;

    try
    {
        if (token)
        {
            let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: "settings" }, Scope.SETTINGS);
            res.json( Entities.UserSettings.formatModel(user.settings) );
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
    let token : string  = req.headers.access_token as string;
    let rawReq : models.Action<any> = req.body;

    try
    {
        //Unused for the moment
        //let user: Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: "settings" },  Scope.SETTINGS);
    
        switch(rawReq.type)
        {
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