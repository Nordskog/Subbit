import * as config from './config'
import * as base64 from 'base-64'

import * as Wetland from 'wetland';
import * as Entities from '~/backend/entity';

import * as api from '~/client/api'
import * as tools from '~/common/tools'
import * as urls from '~/common/urls'
import * as authentication from '~/backend/authentication'
import * as models from '~/common/models'

import * as RFY from '~/backend/rfy'

const activeAuthStates: Map<string, AuthRequestState> = new Map<string, AuthRequestState>();
let clientAuthentication : models.auth.RedditAuth = {access_token : "", expiry: 0};

interface AuthRequestState
{
    identifier: string;
    expiresAt: number;
}

//Requests or updates app-only token
export async function getAppClientAccessToken()
{
    if (clientAuthentication.expiry > ( (Date.now() / 1000) + 30 ))
    {
        //Token still valid
        return clientAuthentication;
    }
    else
    {
        //Request new
        let result = await api.reddit.authenticateAsClient( getHttpBasicAuthHeader() );
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
    return config.redditId;
}

export function getAppSecret() : string
{
    return config.redditSecret;
}

export function getAuthState() : string
{
    let identifier: string = Math.floor(Math.random() * 10000000).toString();

    let state = {
        identifier: identifier,
        expiresAt: new Date().getTime()
    }

    activeAuthStates.set(identifier, state);

    return identifier;
}

export function confirmAuthState(identifier: string) : boolean
{
    let req : AuthRequestState = activeAuthStates.get(identifier);
    if (req)
    {
        //Valid for 5min
        if (req.expiresAt < (new Date().getTime() + (5 * 60 * 1000)))
        {
            activeAuthStates.delete(identifier);
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return false;
    }
}

export function getHttpBasicAuthHeader()
{
    return { "Authorization" : 'Basic '+ base64.encode(config.redditId + ":" + config.redditSecret), "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8" };
}

export function generateRedditLoginUrl()
{
    return tools.url.appendUrlParameters(urls.REDDIT_AUTH_URL,
        {
            client_id: authentication.redditAuth.getAppId(),
            response_type: "code",
            state: authentication.redditAuth.getAuthState(),
            redirect_uri: "http://127.0.0.1:8080/api/authorize_local",
            duration: "permanent",
            scope: "identity read"
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
        username = await api.reddit.getUsername(redditAuth);

        //Fetch existing user if present
        user = await manager.getRepository(Entities.User).findOne({ username: username }, { populate: "auth"});
    }
    else
    {
        username = user.username;
    }

    console.log("Got username: "+ username);

    //TODO this is going to fail is username is "false" isn't it, fucking javascript.
    if (!username)
    {
        console.log("Auth error: Failed to get username");
        return null;
    }
    
    let populator = RFY.wetland.getPopulator( manager );
    user = populator.assign(Entities.User, { username: username, auth: auth}, user, true)
    
    try
    {
        await manager.flush();
        return user;
    }
    catch (err)
    {
        let fetchError = "Auth error: Failed saving user info";
        console.log(fetchError, err);
        return null;
    }
}