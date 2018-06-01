
import * as actions from '~/client/actions'
import * as models from '~/common/models'

export function scrollStateReducer(state = getDefaultScrollState(), action :  models.Action<any>)
{
    switch (action.type)
    {
        //used when a brand new listing starting from page 0 is retrieved
        case actions.types.authors.FETCH_AUTHORS_COMPLETED:
        {
            action = action as models.Action< actions.types.authors.FETCH_AUTHORS_COMPLETED >;

            return {
                ...state,
                currentPage: action.payload.page,
                endReached:  action.payload.end,
                nextPageLoading: false,
                loadingCount: null,
                loadingProgress: null
            }
        }

        case actions.types.page.NEW_PAGE:
        {
            let payload : actions.types.page.NEW_PAGE = action.payload;

            return {
                ...state,
                nextPageLoading: payload.loading,
                loadingCount: null,
                loadingProgress: null
            }
        }

        case actions.types.authors.LOADING_PROGRESS:
        {
            let payload : actions.types.authors.LOADING_PROGRESS = action.payload;

            return {
                ...state,
                ...payload
            }
        }
    }

    return state;
}

export function getDefaultScrollState()
{
    return {
        nextPageLoading : true,
        currentPage: 0,
        endReached: false,
        after : null,
        loadingCount: null,
        loadingProgress: null
    } as models.state.PageState;
}