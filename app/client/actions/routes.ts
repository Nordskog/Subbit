import * as api from '~/client/api'
import * as actions from '~/client/actions'
import * as tools from '~/common/tools'
import * as models from '~/common/models'

import { State } from '~/client/store';


export function authorsRoutes()
{
    return async (dispatch, getState ) =>
    {
        await actions.authors.fetchAuthorsAction()(dispatch, getState);
    }
}

export function managerRoutes()
{
    return async (dispatch, getState ) =>
    {

        console.log("manager route");

        await actions.manager.getManagedSubreddits()(dispatch, getState);
    }
}