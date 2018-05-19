import * as models from '~/common/models'
import * as actionTypes from '~/client/actions/actionTypes'

//Reducer for options, currently empty
export function userReducer(state = getDefaultUserState(), action :  models.Action<any>) : models.state.User
{
    switch(action.type)
    {
        case actionTypes.subscription.SUBSCRIPTIONS_FETCHED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTIONS_FETCHED = action.payload;
            return {
                ...state,
                subscriptions: payload
            }
        }    

        case actionTypes.subscription.SUBSCRIPTION_CHANGED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTION_CHANGED = action.payload;

            return {
                ...state,
                subscriptions: state.subscriptions.map( sub =>
                {
                    if (sub.id == payload.id)
                    {
                        return payload as models.data.Subscription
                    }
                    else
                    {
                        return sub;
                    }
                })
            }
        }

        case actionTypes.subscription.SUBSCRIPTION_ADDED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTION_ADDED = action.payload;

            return {
                ...state,
                subscriptions: [payload as models.data.Subscription].concat( state.subscriptions )
            }
        }

        case actionTypes.subscription.SUBSCRIPTION_REMOVED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTION_REMOVED = action.payload;

            return {
                ...state,
                subscriptions: state.subscriptions.filter( sub =>
                {
                    return (sub.id != payload.id)
                })
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