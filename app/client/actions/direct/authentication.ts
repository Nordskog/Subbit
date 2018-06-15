import * as tools from '~/common/tools'
import * as api from '~/common/api'
import * as models from '~/common/models'
import * as actions from '~/client/actions'
import { State } from '~/client/store';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { RedditAuth } from '~/common/models/auth';


export async function retrieveAndUpdateRedditAuth(dispatch : Dispatch, state : State)
{
    let user: string = tools.store.getUsername(state);
    let token: string = tools.store.getAccessToken(state);

    if (token == null || user == null)
    {
        return null;
    }

    let redditAuth : models.auth.RedditAuth  = tools.store.getRedditAuth(state);
    //Refresh if expiry in less than 5min
    if (redditAuth.expiry < ( (Date.now() / 1000) + (5 * 60) ))
    {
        redditAuth = await api.rfy.authentication.refreshRedditAccessToken(user,token);
        saveRedditAuth(redditAuth);

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

    dispatch({
        type: actions.types.authentication.LOGOUT_SUCCESS,
        payload: {} as actions.types.authentication.LOGOUT_SUCCESS
    });
}

export function saveAuthentication( userInfo : models.auth.UserInfo)
{
        localStorage.setItem('id_token', userInfo.id_token);
        localStorage.setItem('access_token', userInfo.access_token);
        localStorage.setItem('reddit_auth', JSON.stringify(userInfo.redditAuth ) );
}

export function saveRedditAuth( auth : RedditAuth )
{
    localStorage.setItem('reddit_auth', JSON.stringify( auth ) );
}

export function loadAuthentication(dispatch : Dispatch, getState : GetState)
{
    let state : State = getState();
    if (!state.authState.isAuthenticated)
    {
        let id_token = localStorage.getItem('id_token');
        let access_token = localStorage.getItem('access_token');
        let reddit_auth_json = JSON.parse(localStorage.getItem('reddit_auth'));

        if (id_token != null && access_token != null && reddit_auth_json != null)
        {
            let userInfo : models.auth.UserInfo = tools.jwt.decodeTokensToUserInfo(id_token, access_token, reddit_auth_json );
            
            dispatch({
                type: actions.types.authentication.LOGIN_SUCCESS,
                payload: userInfo as actions.types.authentication.LOGIN_SUCCESS
            });
        }
    }


}