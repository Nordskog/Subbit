import serverConfig from 'root/server_config';
import * as base64 from 'base-64';

import * as Wetland from 'wetland';
import * as Entities from '~/backend/entity';

import * as api from '~/common/api';
import * as tools from '~/common/tools';
import * as urls from '~/common/urls';
import * as authentication from '~/backend/authentication';
import * as models from '~/common/models';

import * as RFY from '~/backend/rfy';
import { AuthorizationException } from '~/common/exceptions';

import * as Log from '~/common/log';
import { LoginType } from '~/common/models/auth';
import * as clusterActions from '~/backend/cluster';

import uuidv4 from 'uuid/v4';


const activeAuthStates: Map<string, AuthRequestState> = new Map<string, AuthRequestState>();
let clientAuthentication : models.auth.RedditAuth = {access_token : "", expiry: 0};

interface AuthRequestState
{
    loginType: models.auth.LoginType;
    identifier: string;
    expiresAt: number;
}

// Requests or updates app-only token
export async function getAppClientAccessToken()
{
    // Refresh within 5min of limit
    if (clientAuthentication.expiry > ( (Date.now() / 1000) - (5 * 60) ))
    {
        // Token still valid
        return clientAuthentication;
    }
    else
    {
        // Request new
        let result = await api.reddit.auth.authenticateAsClient( getHttpBasicAuthHeader() );
        if (result != null)
        {
            clientAuthentication = {
                access_token: result.access_token,
                expiry: (Date.now() / 1000) + result.expires_in
            };
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

export function getGeneration() : string
{
    return `${uuidv4()}${Date.now()}`;
}

export function getAuthState( loginType : models.auth.LoginType) : string
{
    // Auth state can use the same id generation I guess
    let identifier: string = loginType + "_" + getGeneration();

    let state = {
        identifier: identifier,
        expiresAt: Date.now() + ( 1000 * 60 * 15), // Valid for 5min
        loginType: loginType
    };

    activeAuthStates.set(identifier, state);

    // Notify other workers
    clusterActions.broadcastAuthState(state.identifier, state.expiresAt, state.loginType);

    return identifier;
}

// Other worker handledinitial requests
export function addAuthState( identifier, expiresAt : number, loginType: LoginType)
{
    let state = {
        identifier: identifier,
        expiresAt: Date.now() + ( 1000 * 60 * 1), // Valid for 1min
        loginType: loginType
    };
    activeAuthStates.set(identifier, state);
}

// Other worker handledinitial requests
export function removeAuthState( identifier : string )
{
    activeAuthStates.delete(identifier);
}

// Get rid of old auth states
export function pruneOldAuthStates()
{
    for ( let [identifier, state] of activeAuthStates )
    {
        if ( state.expiresAt < Date.now() )
        {
            activeAuthStates.delete(identifier);
        }
    }
}

// Throws if invalid
export function confirmAuthState(identifier: string) : models.auth.LoginType
{
    let req : AuthRequestState = activeAuthStates.get(identifier);
    if (req)
    {
        // Valid for 5min
        if ( req.expiresAt > Date.now() )
        {
            activeAuthStates.delete(identifier);
            clusterActions.broadcastAuthStateRemoval(identifier);

            return req.loginType;
        }   
        else
        {
            activeAuthStates.delete(identifier);
            clusterActions.broadcastAuthStateRemoval(identifier);
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
    return { 
                "Authorization" : 'Basic ' + base64.encode(serverConfig.reddit.redditId + ":" + serverConfig.reddit.redditSecret), 
                "Content-Type" : "application/x-www-form-urlencoded;charset=UTF-8",
                'User-Agent' : tools.env.getUseragent()
            };
}

export function generateRedditLoginUrl( loginType : models.auth.LoginType, compactLogin : boolean )
{
    // Accessing anything under /user/ also requires history. Probably because the url doesn't make
    // any distinction between viewing your own user page and other user's pages.
    // Rather than including a permission we don't really need, we will list a single author's post using search.
    let scope : string = "identity read";   
    let duration : string = "permanent";    


    // Additional permissions that will only be requested temporarily.
    if (loginType === LoginType.REDDIT_ADDITIONAL_AUTH)
    {
        scope = "identity privatemessages";
        duration = "temporary";
    }

    return tools.url.appendUrlParameters( compactLogin ? urls.REDDIT_AUTH_URL_COMPACT : urls.REDDIT_AUTH_URL,
        {
            client_id: authentication.redditAuth.getAppId(),
            response_type: "code",
            state: authentication.redditAuth.getAuthState(loginType),    // Keeps track of permanent/session login type
            redirect_uri: urls.RFY_AUTHORIZE_REDIRECT,
            duration: duration,
            scope: scope
        }
    );
}

// Already logged in, but adding additional auth 
export async function updateUserAdditionalAuth( manager : Wetland.Scope, result, user : Entities.User )
{
    // User must already exist, and have a valid, permanent reddit auth

    let auth : Entities.Auth = new Entities.Auth();
    auth.auth_type = "reddit_additional";
    auth.access_token = result.access_token;
    auth.expiry = new Date( (new Date().getTime()) + ( result.expires_in * 1000 ) );
    auth.token_type = "bearer";
    auth.scope = result.scope;

    // As a sanity check, make sure the existing user's username matches that of the user we are getting the new token for.
    {
        let redditAuth : models.auth.RedditAuth = {
            access_token: auth.access_token,
            expiry: tools.time.dateToUnix(auth.expiry)
        };
        let newUsername = await api.reddit.auth.getUsername(redditAuth);

        if (newUsername.toLowerCase() !== user.username.toLowerCase())
        {
            throw new AuthorizationException(`Username of logged in user ${user.username} does not match of retrieved token ${newUsername}`);
        }
    }

    let populator = RFY.wetland.getPopulator( manager );

    // Note spread operator. Behavior with actual entity instances is unpredictable
    user = populator.assign(Entities.User, { additional_auth: {...auth} }, user, true);

    await manager.flush();
}

// Login with permanent auth ( read only access )
export async function createOrUpdateUserFromRedditToken( manager : Wetland.Scope, result, user? : Entities.User)
{
    
    let auth : Entities.Auth = new Entities.Auth();

    auth.auth_type = "reddit";
    auth.access_token = result.access_token;
    auth.expiry = new Date( (new Date().getTime()) + ( result.expires_in * 1000 ) );
    auth.token_type = "bearer";
    auth.scope = result.scope;

    // If obtained with refresh token, it will not be present
    if (result.refresh_token)
    {
        auth.refresh_token = result.refresh_token;
    }

    // No user provided, fetch username from reddit
    let username;
    if( user == null)
    {
        // Most of the api uses the client-side models, which expects a unix time instead of a date
        let redditAuth : models.auth.RedditAuth = {
            access_token: auth.access_token,
            expiry: tools.time.dateToUnix(auth.expiry)
        };
        username = await api.reddit.auth.getUsername(redditAuth);


        // Fetch existing user if present
        user = await manager.getRepository(Entities.User).findOne({ username: username }, { populate: ["auth", "additional_auth"]});
    }
    else
    {
        username = user.username;
    }

    if ( username === null)
    {
        throw new AuthorizationException("Could not retrieve username from reddit");
    }
    
    let populator = RFY.wetland.getPopulator( manager );

    if (user == null)
    {
        Log.A('New user', username, null );

        // Init settings
        let userSettings = new Entities.UserSettings();
        let generation = getGeneration();

        // Note spread operator. Behavior with actual entity instances is unpredictable
        user = populator.assign(Entities.User, { username: username, auth: {...auth}, settings: userSettings, generation }, user, true);
    }
    else
    {
        // Exists, just update auth and stuff
        // Note spread operator. Behavior with actual entity instances is unpredictable
        user = populator.assign(Entities.User, { username: username, auth: {...auth} }, user, true);
    }

    await manager.flush();
    return user;
}
