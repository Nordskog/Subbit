import * as models from '~/common/models'
import * as api from '~/common/api'
import * as serverActions from '~/backend/actions'

export function updatePostsHotScore(subreddit_id : number, until : number, access_token? : string) : Promise<boolean>
{
    return api.rfy.postRequest(
        '/posts', 
        {
            type :    serverActions.post.UPDATE_POST_HOT_SCORE,
            payload : < serverActions.post.UPDATE_POST_HOT_SCORE >
            {
                subreddit_id : subreddit_id,
                until : until,
            }
        },
        access_token );
}