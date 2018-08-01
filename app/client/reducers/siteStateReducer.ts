
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import { LoadingStatus } from '~/common/models';

export function siteStateReducer(state = getDefaultSiteState(), action :  models.Action<any>)
{
    switch (action.type)
    {
        //used when a brand new listing starting from page 0 is retrieved
        case actions.types.page.LOADING_STATE_CHANGED:
        {
            let payload : actions.types.page.LOADING_STATE_CHANGED = action.payload;

            return {
                ...state,
                status:  payload.status,
                loadingCount: null,
                loadingProgress: null
            }
        }

        case actions.types.page.NEW_PAGE:
        {
            let payload : actions.types.page.NEW_PAGE = action.payload;

            return {
                ...state,
                status: payload.status,
                loadingCount: null,
                loadingProgress: null
            }
        }

        case actions.types.page.LOADING_PROGRESS:
        {
            let payload : actions.types.page.LOADING_PROGRESS = action.payload;

            return {
                ...state,
                status: LoadingStatus.LOADING,
                ...payload
            }
        }

        //////////////////
        // Routes
        //////////////////

        case actions.types.Route.STATS:
        {
            return {
                ...state,
                mode: models.SiteMode.STATS
            }
        }

        case actions.types.Route.PRIVACY:
        {
            return {
                ...state,
                mode: models.SiteMode.PRIVACY
            }
        }

        case actions.types.Route.ABOUT:
        {
            return {
                ...state,
                mode: models.SiteMode.ABOUT
            }
        }

        case actions.types.Route.AUTHOR:
        case actions.types.Route.AUTHENTICATE:
        case actions.types.Route.FILTER:
        case actions.types.Route.HOME:
        case actions.types.Route.SUBREDDIT:
        {
            return {
                ...state,
                mode: models.SiteMode.AUTHORS
            }
        }
    }

    return state;
}

export function getDefaultSiteState()
{
    return {
        status: LoadingStatus.LOADING,
        loadingCount: null,
        loadingProgress: null
    } as models.state.SiteState;
}