import * as actions from '~/client/actions'
import * as api from '~/common/api'

export async function searchSubreddits( name : string, dispatch) : Promise<string[]>
{
    let promise : Promise<string[]> = new Promise( async (resolve, reject) => 
    {
        dispatch( async (dispatch, getState) => {

            let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, getState());
            let names = await api.reddit.subreddits.searchSubreddits(name, redditAuth);
            resolve(names);
        });

    });

    return promise;
}