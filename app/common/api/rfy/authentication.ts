import * as urls from '~/common/urls';
import * as tools from '~/common/tools';
import * as api from '~/common/api'
import * as models from '~/common/models'
import * as serverActions from '~/backend/actions'

export function authenticate(code : string, state : string) : Promise< models.auth.UserInfo>
{
        return api.rfy.postRequest(
            '/authorize_local', 
            {
                type :    serverActions.auth.AUTHENTICATE_WITH_REDDIT_CODE,
                payload : < serverActions.auth.AUTHENTICATE_WITH_REDDIT_CODE >
                {
                    code: code,
                    state: state
                }
            },
            null );
}

export function refreshRedditAccessToken(user: string, access_token : string) : Promise<models.auth.RedditAuth>
{
    return api.rfy.getRequest(
        '/authorize_refresh', 
        {
            "user": user,
        },
        access_token    );
}