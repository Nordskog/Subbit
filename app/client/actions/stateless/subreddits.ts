import * as actions from '~/client/actions';
import * as api from '~/common/api';
import { handleError } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';

export async function searchSubreddits( name : string, dispatch : Dispatch) : Promise<string[]>
{
    let promise : Promise<string[]> = new Promise( async (resolve, reject) => 
    {
        dispatch( async (dispatch : Dispatch, getState : GetState) => {

        try
        {
            let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, getState());
            let names = await api.reddit.subreddits.searchSubreddits(name, redditAuth);
            resolve(names);
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
