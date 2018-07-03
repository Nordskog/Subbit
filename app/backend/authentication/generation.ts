import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';

import serverConfig from 'root/server_config'
import * as models from '~/common/models'  
import * as tools from '~/common/tools'  
import * as Entities from '~/backend/entity';
import { AccessToken } from '~/common/models/auth/';

export enum Scope
{
    REDDIT = 'REDDIT',
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    SETTINGS = 'SETTINGS',
    LOGOUT = 'LOGOUT',
    ADMIN = 'ADMIN',
    STATS = 'STATS'
};

export function createIdToken(user: Entities.User)
{
    return jwt.sign(_.pick(user, ['username', 'admin_access', 'stats_access'] ), serverConfig.token.privateKey, { expiresIn: '1 year' });
}

export function createAccessToken(user : Entities.User)
{
    //generation is stored in the db for each user.
    //After token has been verified this value is also checked.
    //This allows us to invalidate all existing tokens for this user.

    //Default scopes any user will have access to
    let tokenScopes : Scope[] = [Scope.SUBSCRIPTIONS, Scope.SETTINGS, Scope.LOGOUT, Scope.REDDIT];

    //Admin and stats scopes.
    //These are verified server-side, and are only used to display ui stuff
    if (user.admin_access)
        tokenScopes.push( Scope.ADMIN);
    if (user.stats_access)
        tokenScopes.push( Scope.STATS);

    let payload : AccessToken = {
        scope: tokenScopes.join(" "),
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
        id_token: { raw:  id_token },
        access_token: access_token,
        redditAuth : {
            access_token : user.auth.access_token,
            expiry : tools.time.dateToUnix(user.auth.expiry)
        }
    };

    return userInfo;
}