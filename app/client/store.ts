﻿
import { getDefaultAuthorState } from '~/client/reducers/authorReducer';
import { getDefaultAuthState } from '~/client/reducers/authStateReducer';
import { getDefaultUserState } from '~/client/reducers/userReducer';
import { getDefaultSiteState } from '~/client/reducers/siteStateReducer';
import * as ReduxFirstRouter from 'redux-first-router';

import * as models from '~/common/models';

export interface State
{
    authorState: models.state.AuthorsState;
    authState: models.auth.AuthState;
    location: ReduxFirstRouter.Location;
    userState: models.state.User;
    siteState: models.state.SiteState;
}

export function getDefaultState(userInfo?: models.auth.UserInfo) : State
{
    return {
        authorState: getDefaultAuthorState(),
        authState: getDefaultAuthState(userInfo),
        location: undefined,
        userState: getDefaultUserState(),
        siteState: getDefaultSiteState(),
    };
}

import configureStore from './configureStore';
import createHistory from 'history/createBrowserHistory';
import { History } from 'history';
import { Store } from 'redux';
import { RouteThunk } from 'redux-first-router';

let reduxStore : Store<State, any> = null;
let history : History = null;
export function getStore() : { store: Store<State, any>, thunk: (Store) => Promise<RouteThunk<any>>, initialDispatch: any, history: History }
{   
    if (reduxStore == null)
    {
        history = createHistory();
        let { store, thunk, initialDispatch} = configureStore(history, ( window as any).REDUX_STATE, );
        reduxStore = store;

        return { store: store, thunk: thunk, initialDispatch: initialDispatch, history: history };
    }

    return { store: reduxStore, thunk: null, initialDispatch: null, history: history };
}
