import * as models from '~/common/models'
import * as requests from '~/backend/actions'
import * as api from '~/common/api'

export function fetchSettings(access_token: string) : Promise<models.data.Settings>
{
    return api.rfy.getRequest(
        '/settings', 
        {

        },
        access_token    );
}