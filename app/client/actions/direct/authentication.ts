import * as tools from '~/common/tools';
import * as api from '~/common/api';
import * as models from '~/common/models';
import * as actions from '~/client/actions';
import { State } from '~/client/store';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { RedditAuth, LoginType } from '~/common/models/auth';


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
        redditAuth = await api.rfy.authentication.refreshRedditAccessToken(user,token);
        saveRedditAuth(redditAuth, state.authState.user.id_token.loginType);

        dispatch({
            type: actions.types.authentication.REDDIT_TOKEN_UPDATED,
            payload: redditAuth
        });
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
