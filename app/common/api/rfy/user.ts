import * as api from '~/common/api';
import { UserSettings } from '~/common/models/data';
import * as serverActions from '~/backend/actions';
import { PostDisplay } from '~/common/models';

export function getAndUpdateLastVisit(accessToken : string) : Promise<number>
{
    return api.rfy.getRequest(
        '/user/last_visit', 
        {

        },
        accessToken );
}

export function getUserSettings(accessToken : string) : Promise<UserSettings>
{
    return api.rfy.getRequest(
        '/user/settings', 
        {

        },
        accessToken );
}

export function setPostDisplayMode( mode : PostDisplay, accessToken: string) : Promise<boolean>
{
   return api.rfy.postRequest(
    '/user', 
    {
        type : serverActions.user.SET_SETTING_POST_DISPLAY_MODE,
        payload : {mode : mode} as serverActions.user.SET_SETTING_POST_DISPLAY_MODE
    },
    accessToken    );
}
