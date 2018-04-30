import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
//import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction'
import { connectRoutes } from 'redux-first-router'

import ReduxThunk from 'redux-thunk'

import { routesMap } from '~/client/routes'
//import options from './options'
const options = { };
import * as reducers from '~/client/reducers'
import * as state from '~/client/store'
//import * as actionCreators from './actions'

export default (history, preLoadedState) => {
    const { reducer, middleware, enhancer, thunk } = connectRoutes(
        history,
        routesMap,
        options
    );

    const rootReducer = combineReducers<state.State>({
        authorState: reducers.authorReducer,
        authState: reducers.authStateReducer,
        location: reducer,
        options: reducers.optionsReducer,
        scrollState: reducers.scrollStateReducer,
        siteState: reducers.siteStateReducer,
        managerState: reducers.managerReducer
    });
    const middlewares = applyMiddleware(middleware, ReduxThunk,);
  const enhancers : any = compose(enhancer, middlewares)
  const store = createStore(
      rootReducer,
      preLoadedState,
      enhancers);

  /*
  if (module.hot && process.env.NODE_ENV === 'development') {
    module.hot.accept('./reducers/index', () => {
      const reducers = require('./reducers/index')
      const rootReducer = combineReducers({ ...reducers, location: reducer })
      store.replaceReducer(rootReducer)
    })
  }
    */

  return { store, thunk }
}

/*
const composeEnhancers = (...args) =>
  typeof window !== 'undefined'
    ? composeWithDevTools({ actionCreators })(...args)
: compose(...args)
*/
//const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
//const composeEnhancers = compose;
//const composeEnhancers = (...args) => compose(...args);