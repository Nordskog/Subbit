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
        accessToken,
        { cache: "no-cache" }
    );
}

export function getUserSettings(accessToken : string) : Promise<UserSettings>
{
    return api.rfy.getRequest(
        '/user/settings', 
        {

        },
        accessToken );
}
