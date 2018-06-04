
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import { LoadingStatus } from '~/common/models';

export function scrollStateReducer(state = getDefaultScrollState(), action :  models.Action<any>)
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
    }

    return state;
}

export function getDefaultScrollState()
{
    return {
        status: LoadingStatus.LOADING,
        loadingCount: null,
        loadingProgress: null
    } as models.state.PageState;
}