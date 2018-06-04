import * as React from 'react'
import * as ReactDOM from 'react-dom/server'
import { Provider } from 'react-redux'
import { flushChunkNames } from 'react-universal-component/server'
import flushChunks from 'webpack-flush-chunks'
import * as components from '~/client/components'

export default ({ clientStats }) => async (req, res, next) =>
{
    return res.send(
        `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>RFY</title>
          <link rel="stylesheet" type="text/css" href="/static/main.css">
          <link rel="stylesheet" type="text/css" href="/static/vendor.css">
        </head>
        <body>

          <div id="root"></div>
          <script type='text/javascript' src='/static/main.js'></script>
          <script type='text/javascript' src='/static/vendor.js'></script>
        </body>-
      </html>`
    )
}
const createApp = (App, store) =>
    <Provider store={store}>
        <App />
    </Provider>