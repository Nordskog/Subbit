﻿
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
            }
        }
    }

    return state;
}

export function getDefaultScrollState()
{
    return {
        nextPageLoading : false,
        currentPage: 0,
        endReached: false,
        after : null
    } as models.state.ScrollState;
}