import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';

let firstLoad : boolean = true;

//Awaiting and calling actions without dispatching is for SSR support

export function authorsRoutes()
{
    return async (dispatch, getState ) =>
    {
        actions.directActions.authentication.loadAuthentication(dispatch, getState);
        await firstLoadDuties(dispatch, getState);
        await actions.authors.fetchAuthorsAction(null, false)(dispatch, getState);
        firstLoad = false;
    }
}

export function managerRoutes()
{
    return async (dispatch, getState ) =>
    {

        console.log("manager route");
        actions.directActions.authentication.loadAuthentication(dispatch, getState);
        await firstLoadDuties(dispatch, getState);
        await actions.manager.getManagedSubreddits()(dispatch, getState);
        firstLoad = false;
    }
}

export function authorizeRoute()
{
    return async (dispatch, getState ) =>
    {
        let { error, code,  state} = getState().location.query;
        if (error)
        {
            //TODO deal with errors
            console.log("Auth failure,",error);
        }
        else
        {
            dispatch( actions.authentication.authenticatedWithRedditCode(code,state) );
        }

    }
}

//Only run on first load
async function firstLoadDuties(dispatch, getState)
{
    if (firstLoad)
    {
         await actions.subscription.fetchSubscriptions()(dispatch, getState);
    }

}