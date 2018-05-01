import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as tools from '~/common/tools'

import { State } from '~/client/store';


export function logoutUserAction()
{
    return async dispatch =>
    {
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
    }
}