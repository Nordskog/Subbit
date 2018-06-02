
import { getDefaultAuthorState } from '~/client/reducers/authorReducer'
import { getDefaultAuthState } from '~/client/reducers/authStateReducer'
import { getDefaultUserState } from '~/client/reducers/userReducer'
import { getDefaultScrollState } from '~/client/reducers/scrollStateReducer'

import * as models from '~/common/models'

export interface State
{
    authorState: models.state.AuthorsState;
    authState: models.auth.AuthState;
    location;
    userState: models.state.User;
    scrollState: models.state.PageState;
};

export function getDefaultState(userInfo?: models.auth.UserInfo)
{
    return {
        authorState: getDefaultAuthorState(),
        authState: getDefaultAuthState(userInfo),
        location: undefined,
        userState: getDefaultUserState(),
        scrollState: getDefaultScrollState(),
    }
}

import configureStore from './configureStore'
import createHistory from 'history/createBrowserHistory'

let store = null;
export function getStore()
{   
    if (store == null)
    {
        const history = createHistory();
        store = configureStore(history, ( window as any).REDUX_STATE).store;
    }
    return store;
}


