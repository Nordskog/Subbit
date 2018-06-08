import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { AuthorizationException } from '~/common/exceptions';
import { AuthorFilter } from '~/common/models';

let firstLoad : boolean = true;

//Awaiting and calling actions without dispatching is for SSR support

export function authorsRoutes()
{
    return WrapWithHandler( async (dispatch, getState ) =>
    {
        actions.directActions.page.clearPage(true, dispatch);
        actions.directActions.authentication.loadAuthentication(dispatch, getState);
        await firstLoadDuties(dispatch, getState);
        await actions.authors.fetchAuthorsAction(false)(dispatch, getState);
        firstLoad = false;
    });
}

export function authorizeRoute()
{
    return WrapWithHandler( async (dispatch, getState ) =>
    {
        let { error, code,  state} = getState().location.query;
        if (error)
        {
            //TODO deal with errors
            throw new AuthorizationException(error);
        }
        else
        {
            await actions.authentication.authenticatedWithRedditCode(code,state)(dispatch, getState);
            dispatch(
                { 
                    type: actions.types.Route.FILTER, payload: { filter: AuthorFilter.SUBSCRIPTIONS } as actions.types.Route.FILTER } 
                );
        }

    });
}

//Only run on first load
async function firstLoadDuties(dispatch, getState)
{
    if (firstLoad)
    {
        firstLoad = false;
         await Promise.all( [
                                actions.subscription.fetchSubscriptions()(dispatch, getState),
                                actions.user.getAndUpdateLastVisit()(dispatch, getState),
                                actions.user.getSettings()(dispatch, getState)
                            ]);
    }
}