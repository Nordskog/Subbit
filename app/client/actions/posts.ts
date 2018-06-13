import { PostDisplay } from "~/common/models";
import * as actions from '~/client/actions'
import { api, tools } from "~/common";
import { State } from "~/client/store";
import { WrapWithHandler } from "~/client/actions/tools/error";
import { Dispatch, GetState } from "~/client/actions/tools/types";

export function changePostDisplay( mode : PostDisplay)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {    
        let state: State = getState();
        let token: string = tools.store.getAccessToken(state);

        if (token != null)
        {
            //Don't want for server response
            api.rfy.user.setPostDisplayMode(mode, token);
        }

        dispatch(
        { 
            type: actions.types.user.POST_DISPLAY_MODE_CHANGED, payload: mode as actions.types.user.POST_DISPLAY_MODE_CHANGED } 
        );
    });
};
