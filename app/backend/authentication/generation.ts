import * as jwt from 'jsonwebtoken';

import serverConfig from 'root/server_config';
import * as models from '~/common/models';  
import * as tools from '~/common/tools';  
import * as Entities from '~/backend/entity';
import { AccessToken } from '~/common/models/auth/';

const PERMANENT_LOGIN_DURATION = 60 * 60 * 24 * 365; // 1 year
const SESSION_LOGIN_DURATION = 60 * 60 * 12;         // 12 hours

export enum Scope
{
    REDDIT = 'REDDIT',
    SUBSCRIPTIONS = 'SUBSCRIPTIONS',
    SETTINGS = 'SETTINGS',
    LOGOUT = 'LOGOUT',
    ADMIN = 'ADMIN',
    STATS = 'STATS'
}

export function createIdToken(user: Entities.User, loginType : models.auth.LoginType) : models.auth.IdToken
{
    // id token info is only used to toggle visibility of ui elements; don't never really trust it.
    let token : models.auth.IdToken = {
        username: user.username,
        admin_access: user.admin_access,
        stats_access: user.stats_access,
        loginType: loginType,
        expiry: ( Date.now() / 1000 ) + ( loginType === models.auth.LoginType.PERMANENT ? PERMANENT_LOGIN_DURATION : SESSION_LOGIN_DURATION )
    };


    let tokenRaw = jwt.sign( 
        token, 
        serverConfig.token.privateKey, 
        { 
            expiresIn: loginType === models.auth.LoginType.PERMANENT ? PERMANENT_LOGIN_DURATION : SESSION_LOGIN_DURATION,
            algorithm: 'RS256',
        });
    token.raw = tokenRaw;

    return token;

}

export function createAccessToken(user : Entities.User, loginType : models.auth.LoginType)
{
    // generation is stored in the db for each user.
    // After token has been verified this value is also checked.
    // This allows us to invalidate all existing tokens for this user.

    // Default scopes any user will have access to
    let tokenScopes : Scope[] = [Scope.SUBSCRIPTIONS, Scope.SETTINGS, Scope.LOGOUT, Scope.REDDIT];

    // Admin and stats scopes.
    // These are verified server-side, and are only used to display ui stuff
    if (user.admin_access)
        tokenScopes.push( Scope.ADMIN);
    if (user.stats_access)
        tokenScopes.push( Scope.STATS);

    let payload : AccessToken = {
        scope: tokenScopes.join(" "),
        sub: user.username,
        generation: user.generation,
        loginType: loginType
    };

    let options : jwt.SignOptions = {
        issuer: serverConfig.token.issuer,
        audience: serverConfig.token.audience,
        expiresIn: loginType === models.auth.LoginType.PERMANENT ? PERMANENT_LOGIN_DURATION : SESSION_LOGIN_DURATION,
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

export function generateUserInfo( user : Entities.User, loginType : models.auth.LoginType)
{
    let idToken : models.auth.IdToken = createIdToken(user, loginType);
    let accessToken : string = createAccessToken(user, loginType);

    let userInfo: models.auth.UserInfo = {
        id_token: idToken,
        access_token: accessToken,
        redditAuth : {
            access_token : user.auth.access_token,
            expiry : tools.time.dateToUnix(user.auth.expiry)
        }
    };

    return userInfo;
}
