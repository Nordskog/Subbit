import * as models from '~/common/models'
import * as actionTypes from '~/client/actions/actionTypes'

//Reducer for options, currently empty
export function managerReducer(state : models.state.ManagerState = getDefaultManagerState(), action : models.Action<any>) : models.state.ManagerState
{
    switch(action.type)
    {

        case actionTypes.manager.SETTINGS_CHANGED:
        {
            action = action as models.Action< actionTypes.manager.SETTINGS_CHANGED >
            return {
                ...state,
                settings: { ...state.settings,
                            ...action.payload }
            }
        }

        case actionTypes.manager.FETCH_SUBREDDITS_COMPLETED:
        {
            action = action as models.Action< actionTypes.manager.FETCH_SUBREDDITS_COMPLETED >
            return {
                ...state,
                subreddits: action.payload
            }
        }

        case actionTypes.manager.SUBREDDIT_ADDED:
        {
            action = action as models.Action< actionTypes.manager.SUBREDDIT_ADDED >
            return {
                ...state,
                subreddits: [action.payload].concat(state.subreddits)
            }
        } 

        case actionTypes.manager.SUBREDDIT_MODIFIED:
        {
            action = action as models.Action< actionTypes.manager.SUBREDDIT_MODIFIED >
            return {
                ...state,
                subreddits: state.subreddits.map( ( subreddit : models.data.Subreddit ) => 
                {
                    if (subreddit.id == action.payload.id)
                    {
                        return {
                            ...subreddit,
                            ...action.payload
                        }
                    }
                    else
                    {
                        return subreddit;
                    }
                } )
            }
        } 

        case actionTypes.manager.SUBREDDIT_REMOVED:
        {
            action = action as models.Action< actionTypes.manager.SUBREDDIT_REMOVED >
            return {
                ...state,
                subreddits: state.subreddits.filter( element => element != action.payload )
            }
        }

        case actionTypes.manager.SCRAPE_BOT_UPDATED:
        {
            action = action as models.Action< actionTypes.manager.SCRAPE_BOT_UPDATED >
            return {
                ...state,
                scrapeBot: {    ...state.scrapeBot,
                                ...action.payload }
            }
        }

        case actionTypes.manager.SCRAPE_JOBS_UPDATED:
        {   
            action = action as models.Action< actionTypes.manager.SCRAPE_JOBS_UPDATED >
            let payload : models.data.ScrapeJob[] = action.payload;
            let map : Map<number,models.data.ScrapeJob> = new Map( payload.map( 
                                                                    ( job: models.data.ScrapeJob ): [number, models.data.ScrapeJob] => [job.subreddit.id, job] ) );

            return {
                ...state,
                subreddits : state.subreddits.map( ( subreddit : models.data.Subreddit ) => 
                    {
                        let job = map.get(subreddit.id);
                        if (job != null)
                        {
                            return {
                                ...subreddit,
                                scrape_job: 
                                {
                                    ...subreddit.scrape_job,
                                    ...job
                                }
                            }
                        }
                        else
                        {
                            return subreddit;
                        }
                    } )  
            }
        }
    }

    return state;
}

export function getDefaultManagerState()
{
    return {
        subreddits: [],
        scrapeBot: 
        {
            enabled     : false,
            interval    : 500,
            concurrent_requests : 2,
        
            worklist_remaining  : 0,
            worklist_total : 0,
            worklist_active : 0,
            processing        : false,
            run_start       : 0,
            next_run       : 0,
        },
        settings : null

    };
}