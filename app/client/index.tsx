//Polyfills
import "promise/polyfill";
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
import * as historyActions from '~/client/actions/direct/history'

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
    const {store, thunk, initialDispatch, history} = Store.getStore();
    historyActions.setHistory(history);


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
        Log.I("Hot reloading");
        render(components.app)
    })
}

