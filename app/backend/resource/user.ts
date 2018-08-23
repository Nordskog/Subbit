import { Request, Response } from 'express';

import * as Express from 'express';

import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

import * as models from '~/common/models';
import * as authentication from '~/backend/authentication';

import * as endpointCommons from './endpointCommons';
import { EndpointException } from '~/common/exceptions';
import { Scope } from '~/backend/authentication/generation';

import * as stats from '~/backend/stats';

import * as Log from '~/common/log';
import * as tools from '~/common/tools';
import serverConfig from 'root/server_config';

const router = Express.Router();

// Set current 
router.get('/api/user/last_visit', async (req: Request, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;

    stats.add(stats.StatsCategoryType.PAGE_LOADS);
    try
    {
        if (token)
        {
                    let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token);

                    Log.A('Update last visit', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

                    stats.add(stats.StatsCategoryType.USER_PAGE_LOADS);

                    let prevDate = ( (<Date> user.last_visit).getTime() / 1000 );

                    res.json( prevDate );

                    user.last_visit = new Date();
                    await manager.flush();           
        }
        else
        {
            Log.A('Update last visit', null, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

            // We don't keep track, so return current time.
            res.json( Date.now() / 1000 );
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, req, res, token);
    }

});

// There are currently no settings stored server side
// But if there were any, this is where you'd get them.
router.get('/api/user/settings', async (req: Request, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;

    try
    {
        if (token)
        {
            let user : Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: "settings" }, Scope.SETTINGS);

            Log.A('List user settings', user.username, tools.http.getReqIp( req, serverConfig.server.reverseProxy ) );

            res.json( Entities.UserSettings.formatModel(user.settings) );
            return;
        }
        else
        {
            throw new EndpointException(403, `User must be logged in`);
        }
    }
    catch (err)
    {
        endpointCommons.handleException(err, req, res, token);
    }

});


router.post('/api/user', async (req: Request, res: Response) =>
{   
    let manager = RFY.wetland.getManager();
    let token : string  = req.headers.access_token as string;
    let rawReq : models.Action<any> = req.body;

    try
    {
        // Unused for the moment
        // let user: Entities.User = await authentication.verification.getAuthorizedUser(manager, token, { populate: "settings" },  Scope.SETTINGS);
    
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
        endpointCommons.handleException(err, req, res, token);
    }
});


export default router;
