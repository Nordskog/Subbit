import serverConfig from 'root/server_config'
import * as base64 from 'base-64'

import * as Wetland from 'wetland';
import * as Entities from '~/backend/entity';

import * as api from '~/common/api'
import * as tools from '~/common/tools'
import * as urls from '~/common/urls'
import * as authentication from '~/backend/authentication'
import * as models from '~/common/models'

import * as RFY from '~/backend/rfy'
import { AuthorizationException } from '~/common/exceptions';

const activeAuthStates: Map<string, AuthRequestState> = new Map<string, AuthRequestState>();
let clientAuthentication : models.auth.RedditAuth = {access_token : "", expiry: 0};

interface AuthRequestState
{
    loginType: models.auth.LoginType;
    identifier: string;
    expiresAt: Date;
}

//Requests or updates app-only token
export async function getAppClientAccessToken()
{
    //Refresh within 5min of limit
    if (clientAuthentication.expiry > ( (Date.now() / 1000) - (5 * 60) ))
    {
        //Token still valid
        return clientAuthentication;
    }
    else
    {
        //Request new
        let result = await api.reddit.auth.authenticateAsClient( getHttpBasicAuthHeader() );
        if (result != null)
        {
            clientAuthentication = {
                access_token: result.access_token,
                expiry: (Date.now() / 1000) + result.expires_in
            }
        }
        else
        {
            clientAuthentication = null;
        }
    }

    return clientAuthentication;
}

export function getAppId() : string
{
    return serverConfig.reddit.redditId;
}

export function getAppSecret() : string
{
    return serverConfig.reddit.redditSecret;
}

export function getAuthState( loginType : models.auth.LoginType) : string
{
    let identifier: string = Math.floor(Math.random() * 10000000).toString();

    let state = {
        identifier: identifier,
        expiresAt: new Date( Date.now() + ( 1000 * 60 * 5) ), //Valid for 5min
        loginType: loginType
    }

    activeAuthStates.set(identifier, state);

    return identifier;
}

//Throws if invalid
export function confirmAuthState(identifier: string) : models.auth.LoginType
{
    let req : AuthRequestState = activeAuthStates.get(identifier);
    if (req)
    {
        //Valid for 5min
        if ( req.expiresAt > new Date() )
        {
            activeAuthStates.delete(identifier);

            return req.loginType;
        }   
        else
        {
            activeAuthStates.delete(identifier);
            throw new AuthorizationException("Log in attempted with expired state");
        }
    }
    else
    {
        throw new AuthorizationException("Log in attempted with unrecorded state");
    }
}

export function getHttpBasicAuthHeader()
{
    return { "Authorization" : 'Basic '+ base64.encode(serverConfig.reddit.redditId + ":" + serverConfig.reddit.redditSecret), "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8" };
}

export function generateRedditLoginUrl( loginType : models.auth.LoginType )
{
    return tools.url.appendUrlParameters(urls.REDDIT_AUTH_URL,
        {
            client_id: authentication.redditAuth.getAppId(),
            response_type: "code",
            state: authentication.redditAuth.getAuthState(loginType),    //Keeps track of permanent/session login type
            redirect_uri: urls.RFY_AUTHORIZE_REDIRECT,
            duration: "permanent",
            scope: "identity read history"
        }
    )
}

export async function createOrUpdateUserFromRedditToken( manager : Wetland.Scope, result, user? : Entities.User)
{
    let auth : Entities.Auth = new Entities.Auth;

    auth.auth_type = "reddit";
    auth.access_token = result.access_token;
    auth.expiry = new Date( (new Date().getTime()) + ( result.expires_in * 1000 ) );
    auth.token_type = "bearer";
    auth.scope = result.scope;

    //If obtained with refresh token, it will not be present
    if (result.refresh_token)
    {
        auth.refresh_token = result.refresh_token;
    }

    //No user provided, fetch username from reddit
    let username;
    if(!user)
    {
        //Most of the api uses the client-side models, which expects a unix time instead of a date
        let redditAuth : models.auth.RedditAuth = {
            access_token: auth.access_token,
            expiry: tools.time.dateToUnix(auth.expiry)
        }
        username = await api.reddit.auth.getUsername(redditAuth);


        //Fetch existing user if present
        user = await manager.getRepository(Entities.User).findOne({ username: username }, { populate: "auth"});
    }
    else
    {
        username = user.username;
    }

    if ( username == null)
    {
        throw new AuthorizationException("Could not retrieve username from reddit");
    }
    
    let populator = RFY.wetland.getPopulator( manager );

    if (user == null)
    {
        //Init settings
        let userSettings = new Entities.UserSettings;
        let generation = Math.floor( Date.now() / 1000 );

        user = populator.assign(Entities.User, { username: username, auth: auth, settings: userSettings, generation }, user, true)
    }
    else
    {
        //Exists, just update auth and stuff
        user = populator.assign(Entities.User, { username: username, auth: auth}, user, true)
    }

    await manager.flush();
    return user;
}