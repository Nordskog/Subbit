import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as actionTools from '~/client/actions/tools'
import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { AuthorizationException } from '~/common/exceptions';
import { AuthorFilter, LoadingStatus } from '~/common/models';
import { Dispatch, GetState } from '~/client/actions/tools/types';

let firstLoad : boolean = true;

//Awaiting and calling actions without dispatching is for SSR support

export function authorsRoutes()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        actionTools.title.updateTitle(getState);
        actions.directActions.page.clearPage(true, dispatch);
        actions.directActions.authentication.loadAuthentication(dispatch, getState);
        await firstLoadDuties(dispatch, getState);
        await actions.authors.fetchAuthorsAction(false)(dispatch, getState);
    });
}

export function statsRoute()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        actionTools.title.updateTitle(getState);
        actions.directActions.page.clearPage(true, dispatch);
        actions.directActions.authentication.loadAuthentication(dispatch, getState);
        await firstLoadDuties(dispatch, getState);
    });
}

export function authorizeRoute()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        actionTools.title.updateTitle(getState);
        let { error, code,  state} = getState().location.query;
        if (error)
        {
            dispatch(
            {
                type: actions.types.page.LOADING_STATE_CHANGED,
                payload: 
                { 
                    status: LoadingStatus.ERROR,

                }  as actions.types.page.LOADING_STATE_CHANGED
            });

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
async function firstLoadDuties(dispatch : Dispatch, getState : GetState)
{
    if (firstLoad)
    {
        firstLoad = false;
         await Promise.all( [
                                actions.subscription.fetchSubscriptions()(dispatch, getState),
                                actions.user.getAndUpdateLastVisit()(dispatch, getState),
                                actions.user.getLocalSettings()(dispatch, getState)
                                //actions.user.getRemoteSettings()(dispatch, getState)  //Currently unused, so let's skip this call
                            ]);
    }
}

