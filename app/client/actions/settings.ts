import { State } from '~/client/store';
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

export function fetchSettings()
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        let filter: string = state.authorState.filter;
        let token: string = tools.store.getAccessToken(state);

        let settings : models.data.Settings = await api.rfy.settings.fetchSettings(token);
  
        dispatch({
            type: actions.types.manager.SETTINGS_CHANGED,
            payload: settings as actions.types.manager.SETTINGS_CHANGED
        });
    }
}