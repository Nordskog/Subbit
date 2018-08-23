import * as models from '~/common/models';
import * as actions from '~/client/actions';
import { Dispatch, GetState } from '~/client/actions/tools/types';


export function saveUserSettings( userSettings : models.data.UserSettings)
{
        localStorage.setItem('user_settings', JSON.stringify( userSettings) );
}

export function loadUserSettings( dispatch : Dispatch )
{

    let userSettingsJson = localStorage.getItem('user_settings');
    if (userSettingsJson != null)
    {
        let userSettings = JSON.parse(userSettingsJson);
        
        dispatch({
            type: actions.types.user.USER_SETTINGS_FETCHED,
            payload: userSettings as actions.types.user.USER_SETTINGS_FETCHED
        });
    }
}
