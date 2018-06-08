﻿import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';

import serverConfig from 'root/server_config'
import * as models from '~/common/models'  
import * as tools from '~/common/tools'  
import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';

export enum scopes
{
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    SETTINGS = 'SETTINGS'
};


export function createIdToken(user: Entities.User)
{
    return jwt.sign(_.pick(user, ['username'] ), serverConfig.token.secret, { expiresIn: 60 * 60 * 5 });
}

export function createAccessToken(user)
{
    let payload = {
        iss: serverConfig.token.issuer,
        aud: serverConfig.token.audience,
        exp: Math.floor(Date.now() / 1000) + (60 * 99999),
        scope: [scopes.SUBSCRIPTIONS, scopes.SETTINGS].join(" "),
        sub: user.username,
        jti: genJti(), // unique identifier for the token
        alg: 'HS256'
    };

    return jwt.sign( payload, serverConfig.token.secret);
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
        redditAuth : {
            access_token : user.auth.access_token,
            expiry : tools.time.dateToUnix(user.auth.expiry)
        }
    };

    return userInfo;
}