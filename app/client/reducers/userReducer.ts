﻿import * as models from '~/common/models';
import * as actionTypes from '~/client/actions/actionTypes';
import { Subscription } from '~/common/models/data';
import * as Log from '~/common/log';

// Reducer for options, currently empty
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
            };
        }    

        case actionTypes.subscription.SUBSCRIPTION_CHANGED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTION_CHANGED = action.payload;

            return {
                ...state,
                subscriptions: state.subscriptions.map( (sub) =>
                {
                    if (sub.id === payload.id)
                    {
                        return payload as models.data.Subscription;
                    }
                    else
                    {
                        return sub;
                    }
                })
            };
        }

        case actionTypes.subscription.SUBSCRIPTION_ADDED:
        case actionTypes.subscription.TEMPORARY_SUBSCRIPTION_ADDED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTION_ADDED = action.payload;

            if ( action.type === actionTypes.subscription.SUBSCRIPTION_ADDED )
            {
                let found : boolean = false;
                let newState = {
                    ...state,
                    subscriptions: state.subscriptions.map( (sub) =>
                    {
                        if ( sub.author === payload.author )
                        {
                            found = true;
                            return payload as models.data.Subscription;
                        }
                        else
                        {
                            return sub;
                        }
                    })
                };

                if (found)
                    return newState;

                Log.E("Could not find temporary subscription to replace, adding new instead");
            }


            {
            // Temporary subscription, just concat.
            // Also called on the off chance we messed up and we didn't find the subscription we're replacing.
            return {
                ...state,
                subscriptions: [payload as models.data.Subscription].concat( state.subscriptions )
            };
            }
        }

        case actionTypes.subscription.SUBSCRIPTION_REMOVED:
        {
            let payload : actionTypes.subscription.SUBSCRIPTION_REMOVED = action.payload;

            return {
                ...state,
                subscriptions: state.subscriptions.filter( (sub) =>
                {
                    return (sub.id !== payload.id);
                })
            };
        }

        case actionTypes.user.POST_DISPLAY_MODE_CHANGED:
        {
            let payload : actionTypes.user.POST_DISPLAY_MODE_CHANGED = action.payload;

            return {
                ...state,
                settings: { 
                            ...state.settings,
                            post_display_mode: payload 
                        }
            };
        }

        case actionTypes.user.LAST_VISIT_UPDATED:
        {
            let payload : actionTypes.user.LAST_VISIT_UPDATED = action.payload;

            return {
                ...state,
                lastVisit: payload
            };
        }

        case actionTypes.user.USER_SETTINGS_FETCHED:
        {
            let payload : actionTypes.user.USER_SETTINGS_FETCHED = action.payload;

            return {
                ...state,
                settings: {  ...state.settings, ...payload }
            };
        }

        

        case actionTypes.authentication.LOGOUT_SUCCESS:
        {
            return {
                ...state,
                subscriptions: []
            };
        }
    }

    return state;
}

export function getDefaultUserState() : models.state.User
{
    return {
        subscriptions: [],
        lastVisit: 0,
        settings: 
        {
            post_display_mode: models.PostDisplay.COMPACT,
        }
    } as models.state.User;
}
