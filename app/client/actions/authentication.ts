import * as api from '~/common/api'
import * as actions from '~/client/actions'

import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { decodeTokensToUserInfo } from '~/common/tools/jwt';

export function authenticatedWithRedditCode(code : string, state : string)
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState) =>
    {
        let userInfo : models.auth.UserInfo = await api.rfy.authentication.authenticate(code,state);

        //Both id_token and the access_token are in string form.
        //We need the former.
        userInfo = decodeTokensToUserInfo(userInfo.id_token.raw, userInfo.access_token, userInfo.redditAuth);

        actions.directActions.authentication.saveAuthentication(userInfo);

        dispatch({
            type: actions.types.authentication.LOGIN_SUCCESS,
            payload: userInfo as actions.types.authentication.LOGIN_SUCCESS
        });
    });
    
}

export function logoutUserAction()
{
    return async (dispatch : Dispatch ) =>
    {
        actions.directActions.authentication.removeAuthentication(dispatch);
        //No sub means home (frontpage)
        dispatch(
            { 
                type: actions.types.Route.HOME, payload: { } } 
            );
    }
}

export function logoutUserOnAllDevices()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        let state : State = getState();
        let token: string = tools.store.getAccessToken(state);

        await api.rfy.authentication.logoutOnAllDevices(token);

        actions.directActions.authentication.removeAuthentication(dispatch);
        //No sub means home (frontpage)
        dispatch(
            { 
                type: actions.types.Route.HOME, payload: { } } 
            );
    });
}

