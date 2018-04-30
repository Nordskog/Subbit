import * as tools from '~/common/tools'
import * as api from '~/client/api'
import * as models from '~/common/models'
import * as actions from '~/client/actions'


export async function retrieveAndUpdateRedditAuth(dispatch, state)
{
    let user: string = tools.store.getUsername(state);
    let token: string = tools.store.getAccessToken(state);

    let redditAuth : models.auth.RedditAuth  = tools.store.getRedditAuth(state);
    //Refresh if expiry in less than 30 seconds
    if ( (redditAuth.expiry - 30) < (Date.now() / 1000 ) )
    {
        console.log("Reddit token expired, refreshing");
        redditAuth = await api.authentication.refreshRedditAccessToken(user,token);

        dispatch({
            type: actions.types.authentication.REDDIT_TOKEN_UPDATED,
            payload: redditAuth
        });
    }

   return redditAuth;
}
