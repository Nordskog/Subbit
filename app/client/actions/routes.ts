import * as api from '~/common/api';
import * as actions from '~/client/actions';
import * as actionTools from '~/client/actions/tools';
import * as tools from '~/common/tools';
import * as models from '~/common/models';

import { State } from '~/client/store';
import { WrapWithHandler } from '~/client/actions/tools/error';
import { AuthorizationException } from '~/common/exceptions';
import { AuthorFilter, LoadingStatus } from '~/common/models';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { History } from 'history';

let firstLoad : boolean = true;

// Route thunks are called multiple times if we await thunk on client side.
// Might be bug, bug unintended call happens before we await the thunk.
// Do not execute any thunks until this has been called.
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
            actions.authors.fetchAuthorsAction(false, isFirstLoad, true)(dispatch, getState).then( () => { restoreScroll(isFirstLoad); } ); 
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
                // Page will display loading indicator while waiting for reply
                actions.authentication.authenticatedWithRedditCode(code,state)(dispatch, getState).then( async () => 
                {
                    // Perform first load duties here, as otherwise the user will have no subscriptions
                    // after being forwarded, resulting in the no-subscriptions-page appearing until fetched.
                    await firstLoadDuties(dispatch, getState);

                    dispatch(
                    { 
                        type: actions.types.Route.FILTER, payload: { filter: AuthorFilter.SUBSCRIPTIONS } as actions.types.Route.FILTER } 
                    );
                });
            }
        }
    });
}

// Only run on first load
async function firstLoadDuties(dispatch : Dispatch, getState : GetState)
{
    if (firstLoad)
    {
        firstLoad = false;
         await Promise.all( [
                                actions.subscription.fetchSubscriptions(true)(dispatch, getState),
                                actions.user.getAndUpdateLastVisit(true)(dispatch, getState),
                                actions.user.getLocalSettings()(dispatch, getState)
                                // actions.user.getRemoteSettings()(dispatch, getState)  //Currently unused, so let's skip this call
                            ]);

        return true;
    }

    return false;
}

// On first load, after authors fetched
async function restoreScroll( shouldScroll : boolean )
{
    // The first time you enter a new route, then follow a link and hit back, the page is almost
    // always completely reloaded, so we don't get any scroll restoration.  Subsequent follow-link-and-backs work fine.
    // Scroll is stored in session before page unload, and restore here if window scroll is 0. 
    // Must be called with setTimeout(), as otherwise it's called too early to have any affect.
    if ( shouldScroll )
    {
        let scroll : number = actions.directActions.session.loadScroll();

        if (scroll != null && scroll > 0 && window.scrollY === 0)
        {
            setTimeout(() => 
            {
                window.scrollTo( { top: scroll, behavior: "instant" } );

            }, 1);

        }
    }

}

