import * as actions from '~/client/actions'
import * as api from '~/common/api'
import { handleError } from '~/client/actions/tools/error';

export async function searchSubreddits( name : string, dispatch) : Promise<string[]>
{
    let promise : Promise<string[]> = new Promise( async (resolve, reject) => 
    {
        dispatch( async (dispatch, getState) => {

        try
        {
            let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, getState());
            let names = await api.reddit.subreddits.searchSubreddits(name, redditAuth);
            resolve(names);
        }
        catch( err )
        {
            handleError(err);
            reject(err);
        }

        });

    });

    return promise;
}