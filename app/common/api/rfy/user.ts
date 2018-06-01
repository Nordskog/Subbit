import * as api from '~/common/api'
import { UserSettings } from '~/common/models/data';
import * as serverActions from '~/backend/actions'
import { PostDisplay } from '~/common/models';

export function getAndUpdateLastVisit(access_token : string) : Promise<number>
{
    return api.rfy.getRequest(
        '/user/last_visit', 
        {

        },
        access_token );
}

export function getUserSettings(access_token : string) : Promise<UserSettings>
{
    return api.rfy.getRequest(
        '/user/settings', 
        {

        },
        access_token );
}

export function setPostDisplayMode( mode : PostDisplay, access_token: string) : Promise<boolean>
{
   return api.rfy.postRequest(
    '/user', 
    {
        type : serverActions.user.SET_SETTING_POST_DISPLAY_MODE,
        payload : {mode : mode} as serverActions.user.SET_SETTING_POST_DISPLAY_MODE
    },
    access_token    );
}