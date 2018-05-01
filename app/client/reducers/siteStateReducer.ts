import * as models from '~/common/models'
import * as actions from '~/client/actions'

//Reducer for options, currently empty
export function siteStateReducer(state = getDefaultSiteState(), action)
{
    switch(action.type)
    {
        //Author mode
        case 'HOME':
        case 'NEW':
        case 'HOT':
        case 'SUBS':
        case 'SUBREDDIT':
        case 'AUTHOR':
        {
            return {
                ...state,
                mode: models.state.SiteMode.AUTHORS
            }
        }

        //Manage mode
        case 'MANAGER':
        {
            return {
                ...state,
                mode: models.state.SiteMode.MANAGER
            }
        }

        //Generally the site-wide list of subreddits will never be modified
        //while the user is browsing, but will happen when the manager adds/removes them.
        case actions.types.manager.SUBREDDIT_ADDED:
        {
            return {
                ...state,
                subreddits: [action.payload].concat(state.subreddits)
            }
        } 

        case actions.types.manager.SUBREDDIT_REMOVED:
        {
            return {
                ...state,
                subreddits: state.subreddits.filter( ( subreddit : models.data.Subreddit ) => subreddit.id != action.payload.id )
            }
        }

    }


    return state;
}

export function getDefaultSiteState(mode? : models.state.SiteMode, subreddits? : models.data.Subreddit[])
{
    return {
        subreddits: subreddits ? subreddits : [
            {
                id: 0,
                name: 'hfy'
            }
        ],
        mode : models.state.SiteMode.AUTHORS

    };
}