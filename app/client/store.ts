
import { getDefaultAuthorState } from '~/client/reducers/authorReducer'
import { getDefaultAuthState } from '~/client/reducers/authStateReducer'
import { getDefaultUserState } from '~/client/reducers/userReducer'
import { getDefaultScrollState } from '~/client/reducers/scrollStateReducer'
import { getDefaultSiteState } from '~/client/reducers/siteStateReducer'
import { getDefaultManagerState } from '~/client/reducers/managerReducer'

import * as models from '~/common/models'

export interface State
{
    authorState: models.state.AuthorsState;
    authState: models.auth.AuthState;
    location;
    userState: models.state.User;
    scrollState: models.state.ScrollState;
    siteState: models.state.SiteState;
    managerState: models.state.ManagerState;
};

export function getDefaultState(userInfo?: models.auth.UserInfo, subredditList? : models.data.Subreddit[])
{
    return {
        authorState: getDefaultAuthorState(),
        authState: getDefaultAuthState(userInfo),
        location: undefined,
        userState: getDefaultUserState(),
        scrollState: getDefaultScrollState(),
        siteState: getDefaultSiteState(models.state.SiteMode.AUTHORS, subredditList),
        managerState: getDefaultManagerState()
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


