import { PostDisplay } from "~/common/models";
import * as actions from '~/client/actions'
import { api, tools, models } from "~/common";
import { State } from "~/client/store";
import { WrapWithHandler, handleError } from "~/client/actions/tools/error";
import { Dispatch, GetState } from "~/client/actions/tools/types";

export function changePostDisplay( mode : PostDisplay)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {   
        let userSettings : models.data.UserSettings = {
            ...getState().userState.settings,
            post_display_mode: mode
        };

        //Maybe rethink if we ever add more than a few settings
        actions.directActions.user.saveUserSettings(userSettings);

        dispatch(
        { 
            type: actions.types.user.POST_DISPLAY_MODE_CHANGED, payload: mode as actions.types.user.POST_DISPLAY_MODE_CHANGED } 
        );
    });
};
