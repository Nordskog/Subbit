﻿import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { connectRoutes } from 'redux-first-router';
import restoreScroll from 'redux-first-router-restore-scroll';

import ReduxThunk from 'redux-thunk';

import * as QueryString from 'query-string';

import { routesMap } from '~/client/routes';

import * as reducers from '~/client/reducers';
import * as state from '~/client/store';

export default (history, preLoadedState) => {
    const { reducer, middleware, enhancer, thunk, initialDispatch } = connectRoutes(
        history,
        routesMap,
        {
          querySerializer: QueryString,
        }
    );

    const rootReducer = combineReducers<state.State>({
        authorState: reducers.authorReducer,
        authState: reducers.authStateReducer,
        location: reducer,
        userState: reducers.userReducer,
        siteState: reducers.siteStateReducer,
    });
    const middlewares = applyMiddleware(middleware, ReduxThunk,);
  const enhancers : any = compose(enhancer, middlewares);// , (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__())
  const store = createStore(
      rootReducer,
      preLoadedState,
      enhancers,
    );

  return { store, thunk, initialDispatch };
};
