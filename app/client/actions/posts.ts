import { PostDisplay } from "~/common/models";
import * as actions from '~/client/actions'

export function changePostDisplay( mode : PostDisplay)
{
    return async function (dispatch, getState)
    {    
            dispatch(
            { 
                type: actions.types.user.POST_DISPLAY_MODE_CHANGED, payload: mode as actions.types.user.POST_DISPLAY_MODE_CHANGED } 
            );
    }
};
