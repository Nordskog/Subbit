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
        if (loadFromSession)
            actions.directActions.session.loadLastVisit();

        if (lastVisit == null)
        {
            let state: State = getState();
            let token: string = tools.store.getAccessToken(state);
    
            //No user, no tracking visit
            if (token == null)
                return;
    
            lastVisit = await api.rfy.user.getAndUpdateLastVisit(token);
            actions.directActions.session.saveLastVisit(lastVisit);
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