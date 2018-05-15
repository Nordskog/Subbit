import * as tools from '~/common/tools'
import * as api from '~/common/api'
import * as models from '~/common/models'
import * as actions from '~/client/actions'
import { State } from '~/client/store';


export async function retrieveAndUpdateRedditAuth(dispatch, state)
{
    let user: string = tools.store.getUsername(state);
    let token: string = tools.store.getAccessToken(state);

    if (token == null || user == null)
    {
        return null;
    }

    let redditAuth : models.auth.RedditAuth  = tools.store.getRedditAuth(state);
    //Refresh if expiry in less than 30 seconds
    if ( (redditAuth.expiry - 30) < (Date.now() / 1000 ) )
    {
        console.log("Reddit token expired, refreshing");
        redditAuth = await api.rfy.authentication.refreshRedditAccessToken(user,token);

        dispatch({
            type: actions.types.authentication.REDDIT_TOKEN_UPDATED,
            payload: redditAuth
        });
    }

   return redditAuth;
}

export function removeAuthentication(dispatch)
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

export function loadAuthentication(dispatch, getState)
{
    let state : State = getState();
    if (!state.authState.isAuthenticated)
    {
        let id_token = localStorage.getItem('id_token');
        let access_token = localStorage.getItem('access_token');
        let reddit_auth_json = localStorage.getItem('reddit_auth');

        if (id_token != null && access_token != null && reddit_auth_json != null)
        {
            let userInfo : models.auth.UserInfo = tools.jwt.decodeTokensToUserInfo(id_token, access_token, JSON.parse(reddit_auth_json) );
            dispatch({
                type: actions.types.authentication.LOGIN_SUCCESS,
                payload: userInfo as actions.types.authentication.LOGIN_SUCCESS
            });
        }
    }


}