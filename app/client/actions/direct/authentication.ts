import * as tools from '~/common/tools';
import * as api from '~/common/api';
import * as models from '~/common/models';
import * as actions from '~/client/actions';
import { State } from '~/client/store';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { RedditAuth, LoginType } from '~/common/models/auth';
import { NetworkException, Exception, LogOnlyException } from '~/common/exceptions';
import * as log from '~/common/log';
import { toast, ToastType } from "~/client/toast";
import { handleError } from '~/client/actions/tools/error';

// Set to true on failure, false on success, so we only display it once.
let tokenRefreshFailedErrorDisplayed : boolean = false;

export async function retrieveAndUpdateRedditAuth(dispatch : Dispatch, state : State)
{
    let user: string = tools.store.getUsername(state);
    let token: string = tools.store.getAccessToken(state);

    if (token == null || user == null)
    {
        return null;
    }

    let redditAuth : models.auth.RedditAuth  = tools.store.getRedditAuth(state);

    // Refresh if expiry in less than 5min
    if (redditAuth.expiry < ( (Date.now() / 1000) + (5 * 60) ))
    {
        try
        {
            redditAuth = await api.rfy.authentication.refreshRedditAccessToken(user,token);
            saveRedditAuth(redditAuth, state.authState.user.id_token.loginType);
    
            tokenRefreshFailedErrorDisplayed = false;

            dispatch({
                type: actions.types.authentication.REDDIT_TOKEN_UPDATED,
                payload: redditAuth
            });
        }
        catch ( err )
        {
            if ( err instanceof NetworkException )
            {
                // User will be logged out
                if ( err.code === 401 )
                {
                    throw err;
                }
                else
                {
                    // Failed for some other network reason.
                    // Probably means the server is down.
                    // Return existing, expired auth.
                    // Api handler is responsible for checking if valid
                    // and will fall back to unauthenticated access
                    if ( !tokenRefreshFailedErrorDisplayed )
                    {
                        tokenRefreshFailedErrorDisplayed = true;

                        handleError(dispatch, new LogOnlyException( "Could not refresh Reddit access token", err ));
                        toast( ToastType.WARNING, 10000, "Reddit token refresh failed", "Unable to display upvotes");                        
                    }

                    return redditAuth;
                }
            }
            else
            {
                throw err;
            }
        }
    }

    return redditAuth;
}

export function removeAuthentication(dispatch : Dispatch)
{
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('reddit_auth');

    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('reddit_auth');

    dispatch({
        type: actions.types.authentication.LOGOUT_SUCCESS,
        payload: {} as actions.types.authentication.LOGOUT_SUCCESS
    });
}

export function saveAuthentication( userInfo : models.auth.UserInfo)
{
    let storage = localStorage;
    if (userInfo.id_token.loginType === LoginType.SESSION)
        storage = sessionStorage;

    storage.setItem('id_token', JSON.stringify(userInfo.id_token) );
    storage.setItem('access_token', userInfo.access_token);
    storage.setItem('reddit_auth', JSON.stringify(userInfo.redditAuth ) );
}

export function saveRedditAuth( auth : RedditAuth, loginType : models.auth.LoginType)
{
    let storage = localStorage;
    if (loginType === LoginType.SESSION)
        storage = sessionStorage;

    storage.setItem('reddit_auth', JSON.stringify( auth ) );

}

function loadAuthenticationFromStorage( storage : Storage)
{
    let idTokenRaw = storage.getItem('id_token');
    let accessToken = storage.getItem('access_token');
    let redditAuthJson = storage.getItem('reddit_auth');

    return { idTokenRaw, accessToken, redditAuthJson  };

}

export function loadAuthentication(dispatch : Dispatch, getState : GetState)
{
    let state : State = getState();
    if (!state.authState.isAuthenticated)
    {
        // Check local storage
        let { idTokenRaw, accessToken, redditAuthJson  } = loadAuthenticationFromStorage(localStorage);

        // If nulls present, check session storage
        if (idTokenRaw == null || accessToken == null || redditAuthJson == null)
            ({ idTokenRaw, accessToken, redditAuthJson  } = loadAuthenticationFromStorage(localStorage) );

        // If still null then we don't have any stored credentials
        if (idTokenRaw != null && accessToken != null && redditAuthJson != null)
        {
            let userInfo : models.auth.UserInfo = tools.jwt.combineUserInfo(JSON.parse(idTokenRaw), accessToken, JSON.parse(redditAuthJson ) );
            
            dispatch({
                type: actions.types.authentication.LOGIN_SUCCESS,
                payload: userInfo as actions.types.authentication.LOGIN_SUCCESS
            });
        }
    }


}
