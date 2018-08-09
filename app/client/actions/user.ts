import { State } from "~/client/store";
import { api, tools, models } from "~/common";
import * as actions from '~/client/actions'
import { WrapWithHandler } from "~/client/actions/tools/error";
import { Dispatch, GetState } from "~/client/actions/tools/types";


export function getAndUpdateLastVisit( loadFromSession : boolean = false)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let lastVisit : number;

        //Load from session when navigating or restoring tab, as we don't consider this a separate visit.
        if (loadFromSession != null)
        {
            lastVisit = actions.directActions.session.loadLastVisit();
        }

        //Otherwise attempt loading from local storage.
        if (lastVisit == null)
        {
            //Attempt to load from storage
            lastVisit = actions.directActions.storage.loadLastVisit();

            let state: State = getState();
            let token: string = tools.store.getAccessToken(state);

            //Get last recorded value server-side
            let newLastVisit = await api.rfy.user.getAndUpdateLastVisit(token);

            let now = Date.now()/1000;

            //All of this has the ultimate effect of the current lastVisit time sticking even if the user refreshes the page.
            //If they go more than 2min without refreshing the page it will be updated.

            // If storage value is available, use it unless sever-side value was recorded more than 2 minutes ago.
            if (lastVisit != null && ( newLastVisit + (60 * 5) ) >  ( Date.now() / 1000 ) )
            {
                //Lastvisit remains as storage value.
            }
            else
            {
                //User server-recorded value
                lastVisit = newLastVisit;
            }

            actions.directActions.storage.saveLastVisit(lastVisit);
            actions.directActions.session.saveLastVisit(lastVisit);
        }
        else
        {
            //If present in session storage we want to keep this admittedly out-of-date value
        }

        dispatch({
            type: actions.types.user.LAST_VISIT_UPDATED,
            payload: lastVisit as actions.types.user.LAST_VISIT_UPDATED
        });

    });
}

export function getLocalSettings()
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        actions.directActions.user.loadUserSettings(dispatch);
    });
}

//Currently unused, but endpoint exists.
export function getRemoteSettings()
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();
    
        let token: string = tools.store.getAccessToken(state);

        //No user, no tracking visit
        if (token == null)
            return;

        let settings : models.data.UserSettings = await api.rfy.user.getUserSettings(token);

        dispatch({
            type: actions.types.user.USER_SETTINGS_FETCHED,
            payload: settings as actions.types.user.USER_SETTINGS_FETCHED
        });
    });
}