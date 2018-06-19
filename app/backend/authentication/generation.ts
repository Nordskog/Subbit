import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';

import serverConfig from 'root/server_config'
import * as models from '~/common/models'  
import * as tools from '~/common/tools'  
import * as Entities from '~/backend/entity';
import { AccessToken } from '~/common/models/auth/';

export enum scopes
{
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    SETTINGS = 'SETTINGS'
};

export function createIdToken(user: Entities.User)
{
    return jwt.sign(_.pick(user, ['username'] ), serverConfig.token.privateKey, { expiresIn: 60 * 60 * 5 });
}

export function createAccessToken(user : Entities.User)
{
    //generation is stored in the db for each user.
    //After token has been verified this value is also checked.
    //This allows us to invalidate all existing tokens for this user.

    let payload : AccessToken = {
        scope: [scopes.SUBSCRIPTIONS, scopes.SETTINGS].join(" "),
        sub: user.username,
        generation: user.generation
    };

    let options : jwt.SignOptions = {
        issuer: serverConfig.token.issuer,
        audience: serverConfig.token.audience,
        expiresIn: '1 year',
        algorithm: 'RS256',
        jwtid: genJti(), // unique identifier for the token
    };


    return jwt.sign( payload, serverConfig.token.privateKey, options );
}

// Generate Unique Identifier for the access token
function genJti()
{
    let jti = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 16; i++)
    {
        jti += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return jti;
}

export function generateUserInfo( user : Entities.User)
{
    let id_token : string = createIdToken(user);
    let access_token : string = createAccessToken(user);

    let userInfo: models.auth.UserInfo = {
        id_token: id_token,
        access_token: access_token,
        redditAuth : {
            access_token : user.auth.access_token,
            expiry : tools.time.dateToUnix(user.auth.expiry)
        }
    };

    return userInfo;
}