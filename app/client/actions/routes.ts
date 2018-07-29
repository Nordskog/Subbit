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
import { History } from 'history';

let firstLoad : boolean = true;

//Route thunks are called multiple times if we await thunk on client side.
//Might be bug, bug unintended call happens before we await the thunk.
//Do not execute any thunks until this has been called.
let awaited : boolean = false;
export function notifyReady()
{
    awaited = true;
}

export function authorsRoutes()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        if (awaited)
        {
            let isFirstLoad : boolean = firstLoad;

            actionTools.title.updateTitle(getState);
            if (!isFirstLoad)
                actions.directActions.page.clearPage(true, dispatch);
            actions.directActions.authentication.loadAuthentication(dispatch, getState);
            await firstLoadDuties(dispatch, getState);
            actions.authors.fetchAuthorsAction(false, isFirstLoad, true)(dispatch, getState); 
        }

    });
}

export function statsRoute()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        if (awaited)
        {
            actionTools.title.updateTitle(getState);
            actions.directActions.page.clearPage(true, dispatch);
            actions.directActions.authentication.loadAuthentication(dispatch, getState);
            await firstLoadDuties(dispatch, getState);
        }

    });
}

export function aboutRoute()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        if (awaited)
        {
            actionTools.title.updateTitle(getState);
            actions.directActions.page.clearPage(true, dispatch);
            actions.directActions.authentication.loadAuthentication(dispatch, getState);
            await firstLoadDuties(dispatch, getState);
        }

    });
}

export function authorizeRoute()
{
    return WrapWithHandler( async (dispatch : Dispatch, getState : GetState ) =>
    {
        if (awaited)
        {
            actionTools.title.updateTitle(getState);
            let { error, code,  state} = getState().location.query as any;
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
                                actions.subscription.fetchSubscriptions(true)(dispatch, getState),
                                actions.user.getAndUpdateLastVisit(true)(dispatch, getState),
                                actions.user.getLocalSettings()(dispatch, getState)
                                //actions.user.getRemoteSettings()(dispatch, getState)  //Currently unused, so let's skip this call
                            ]);

        return true;
    }

    return false;
}

