export import stats = require('./stats');
export import errors = require('./errors');
export import auth = require('./auth');

import * as keepAlive from '~/client/websocket/keepAlive'

export function notifyPong( )
{
    keepAlive.notifyPong();
}