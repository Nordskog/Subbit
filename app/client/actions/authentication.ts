import * as api from '~/common/api'
import * as actions from '~/client/actions'

import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';

export function authenticatedWithRedditCode(code : string, state : string)
{
    return WrapWithHandler( async (dispatch, getState) =>
    {
        let userInfo : models.auth.UserInfo = await api.rfy.authentication.authenticate(code,state);

        actions.directActions.authentication.saveAuthentication(userInfo);

        dispatch({
            type: actions.types.authentication.LOGIN_SUCCESS,
            payload: userInfo as actions.types.authentication.LOGIN_SUCCESS
        });
    });
    
}

export function logoutUserAction()
{
    return async dispatch =>
    {
        actions.directActions.authentication.removeAuthentication(dispatch);
        //No sub means home (frontpage)
        dispatch(
            { 
                type: 'HOME', payload: { } } 
            );
    }
}

