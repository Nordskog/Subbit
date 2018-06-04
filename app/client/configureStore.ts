﻿import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
//import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction'
import { connectRoutes } from 'redux-first-router'

import ReduxThunk from 'redux-thunk'

import * as QueryString from 'query-string'

import { routesMap } from '~/client/routes'
//import options from './options'

import * as reducers from '~/client/reducers'
import * as state from '~/client/store'
//import * as actionCreators from './actions'

export default (history, preLoadedState) => {
    const { reducer, middleware, enhancer, thunk } = connectRoutes(
        history,
        routesMap,
        {
          querySerializer: QueryString
        }
    );

    const rootReducer = combineReducers<state.State>({
        authorState: reducers.authorReducer,
        authState: reducers.authStateReducer,
        location: reducer,
        userState: reducers.userReducer,
        scrollState: reducers.scrollStateReducer,
    });
    const middlewares = applyMiddleware(middleware, ReduxThunk,);
  const enhancers : any = compose(enhancer, middlewares)
  const store = createStore(
      rootReducer,
      preLoadedState,
      enhancers);

  return { store, thunk }
}