

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import * as components from '~/client/components'
import * as Store from '~/client/store'
import * as setup from './setup'

import * as Log from '~/common/log';

//Sets up a toast callback
setup.setupClientStuff();

///////////////////
// Render app
///////////////////

const render = App => {
  const root = document.getElementById('root')

  ReactDOM.hydrate(
        <Provider store={Store.getStore()}>
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
        render(components.app)
    })
}

