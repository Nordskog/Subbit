

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import AppContainer from 'react-hot-loader/lib/AppContainer'
import * as components from '~/client/components'
import * as Store from '~/client/store'
import * as setup from './setup'

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
996
///////////////
// Hot reload
///////////////

declare var module: any
if (module.hot && process.env.NODE_ENV === 'development')
{
    console.log("Hot!");
    module.hot.accept(components.app, () =>
    {
        render(components.app)
    })
}

