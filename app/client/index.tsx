﻿//Polyfills
import "promise/polyfill"
import 'core-js/es6/object';
import 'core-js/es6/array';
import 'core-js/es6/map';
import * as polyfills from './polyfills';
polyfills.fill();


import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import * as components from '~/client/components'
import * as Store from '~/client/store'
import * as setup from './setup'

import * as Log from '~/common/log';

import * as routeActions from '~/client/actions/routes'
import * as sessionActions from '~/client/actions/direct/session'


// Last fetched authors are retained in sessionStorage and reloaded
// so the page can be rendered instantly. Clear if navigation type is not TYPE_BACK_FORWARD
if (performance.navigation.type != PerformanceNavigation.TYPE_BACK_FORWARD)
{
    sessionActions.clear();
}

//Sets up a toast callback
setup.setupClientStuff();

///////////////////
// Render app
///////////////////

async function awaitStore(store, thunk, initialDispatch)
{
    if (thunk != null)
    {

        //The route thunk is always called, and is thus called again by us here.
        //if we await it. May be a bug. Thunks will not execute until this is called.
        routeActions.notifyReady();
        await thunk(store);
    }
    
    return store;
}

async function render(App)
{
    const root = document.getElementById('root')
    const {store, thunk, initialDispatch } = Store.getStore();

    ReactDOM.hydrate(
        <Provider store={await awaitStore(store, thunk, initialDispatch)}>
            <App />
        </Provider>,
    root
    )
}

render(components.app);

///////////////
// Hot reload
///////////////

declare var module: any
if (module.hot && process.env.NODE_ENV === 'development')
{
    Log.I("Hot!");
    module.hot.accept(components.app, () =>
    {
        console.log("Hot reloading");
        render(components.app)
    })
}

