import * as models from '~/common/models'
import * as actionTypes from '~/client/actions/actionTypes'

//Reducer for options, currently empty
export function userReducer(state = getDefaultUserState(), action :  models.Action<any>) : models.state.User
{
    switch(action.type)
    {
        case actionTypes.subscription.SUBSCRIPTIONS_FETCHED:
        {

            console.log("Subs:",action.payload);

            let payload : actionTypes.subscription.SUBSCRIPTIONS_FETCHED = action.payload;
            return {
                ...state,
                subscriptions: payload
            }
        }    
    }

    return state;
}

export function getDefaultUserState() : models.state.User
{
    return {
        subscriptions: []
    } as models.state.User;
}