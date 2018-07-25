import * as stats from './stats'
import * as errors from './errors'
import * as auth from './auth'

export 
{
    stats, errors, auth
}

import * as keepAlive from '~/client/websocket/keepAlive'

export function notifyPong( )
{
    keepAlive.notifyPong();
}