import * as _ from 'lodash';
import * as config from './config'
import * as jwt from 'jsonwebtoken';

import * as models from '~/common/models'  
import * as tools from '~/common/tools'  
import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

export const scopes = 
    {
        SUBSCRIPTIONS: 'SUBSCRIPTIONS'
    };

export const secret = config.secret;

export function createIdToken(user: Entities.User)
{
    return jwt.sign(_.pick(user, ['username'] ), config.secret, { expiresIn: 60 * 60 * 5 });
}

export function createAccessToken(user)
{
    let payload = {
        iss: config.issuer,
        aud: config.audience,
        exp: Math.floor(Date.now() / 1000) + (60 * 99999),
        scope: scopes.SUBSCRIPTIONS,
        sub: user.username,
        jti: genJti(), // unique identifier for the token
        alg: 'HS256'
    };

    return jwt.sign( payload, config.secret);
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
    let id_token = createIdToken(user);
    let access_token = createAccessToken(user);

    let redditTokenExpiry : Date = user.auth.expiry;

    let userInfo: models.auth.UserInfo = {
        id_token: id_token,
        access_token: access_token,
        last_visit: (<Date>user.last_visit).getTime() / 1000,
        redditAuth : {
            access_token : user.auth.access_token,
            expiry : tools.time.dateToUnix(user.auth.expiry)
        }
    };

    return userInfo;
}