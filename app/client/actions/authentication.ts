import * as api from '~/common/api'
import * as actions from '~/client/actions'

import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';

export function authenticatedWithRedditCode(code : string, state : string)
{
    return async dispatch =>
    {
        let userInfo : models.auth.UserInfo = await api.rfy.authentication.authenticate(code,state);

        actions.directActions.authentication.saveAuthentication(userInfo);

        dispatch({
            type: actions.types.authentication.LOGIN_SUCCESS,
            payload: userInfo as actions.types.authentication.LOGIN_SUCCESS
        });
    }
    
}

export function logoutUserAction()
{
    return async dispatch =>
    {

        actions.directActions.authentication.removeAuthentication(dispatch);

        /*
        if ( await api.rfy.authentication.logout() )
        {
            console.log("Logged out");

            dispatch({
                type: actions.types.authentication.LOGOUT_SUCCESS,
                payload:
                {
                    isAuthenticated: false
                } as actions.types.authentication.LOGOUT_SUCCESS
            });

            dispatch(actions.authors.fetchAuthorsAction())
        }
        else
        {
            console.log("Failed to logout for some reason");
        }
        */
    }
}

