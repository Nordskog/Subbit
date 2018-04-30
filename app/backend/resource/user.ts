import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';

import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';

import * as Wetland from 'wetland';

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
            let user : Entities.User = await authentication.verification.getUserIfAuthorized(manager, token);
            if (user)
            {
                let prevDate = ( (<Date>user.last_visit).getTime() / 1000 );
                let currentDate = Date.now() / 1000;

                //Always return last visit
                res.json( prevDate );

                //Only update if more than 5min ago
                if ( (currentDate - prevDate) > 500 )
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

module.exports = router;