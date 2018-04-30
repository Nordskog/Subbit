import * as React from 'react'
import * as ReactDOM from 'react-dom/server'
import { Provider } from 'react-redux'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import configureStore from './configureStore'
import * as components from '~/client/components'

export default ({ clientStats }) => async (req, res, next) =>
{
    
    const store = await configureStore(req, res)
    if (!store) return // no store means redirect was already served

    const app = createApp(components.app, store)

    let appString;
    try
    {
        appString = ReactDOM.renderToString(app)
    }
    catch (err)
    {
        res.status(500).json("{Shit hit fan}");
        next(err);
        return;
    }

    //Once the app has been rendered on the server, change the state to client for its intial state
    let state = store.getState();
    const stateJson = JSON.stringify( { 
        ...state,
        options: {
            ...state.options,
            isClient: true
        }

     })

     
    //const chunkNames = flushChunkNames()

    //const { js, styles, css } = flushChunks(clientStats, { chunkNames })

    return res.send(
        `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>RFY</title>
          <link rel="stylesheet" type="text/css" href="/static/main.css">
          <link rel="stylesheet" type="text/css" href="/static/vendor.css">
          <script>window.REDUX_STATE = ${stateJson}</script>
        </head>
        <body>
          <div id="root">${appString}</div>
          <script type='text/javascript' src='/static/main.js'></script>
          <script type='text/javascript' src='/static/vendor.js'></script>
        </body>
      </html>`
    )
}

//                    <div id="root">${appString}</div>
//         

const createApp = (App, store) =>
    <Provider store={store}>
        <App />
    </Provider>

function pathToStylesheet(path: string) : string
{
    return `<link rel="stylesheet" type="text/css" href="${path}" >`;
}