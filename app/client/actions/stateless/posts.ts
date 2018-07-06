import * as actions from '~/client/actions'
import * as api from '~/common/api'
import { handleError } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { Post } from '~/common/models/reddit';

export async function searchPosts( subreddit : string, queryTerm : string, dispatch : Dispatch) : Promise<Post[]>
{
    let promise : Promise<Post[]> = new Promise( async (resolve, reject) => 
    {
        dispatch( async (dispatch : Dispatch, getState : GetState) => {

        try
        {
            let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, getState());
            let posts = await api.reddit.posts.searchPosts(subreddit, queryTerm, 10, redditAuth);
            resolve(posts);
        }
        catch( err )
        {
            handleError(dispatch, err);
            reject(err);
        }

        });

    });

    return promise;
}
