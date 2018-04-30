
import * as urls from '~/common/urls'
import * as protocols from '~/backend/sockets/protocols'
import * as models from '~/common/models'
import * as handler from '~/client/websocket/handler'
import * as serverActions from '~/backend/actions'
import { setTimeout } from 'timers';

let ws : WebSocket = null;

export function connect()
{
    disconnect();

    ws = new WebSocket(urls.RFY_WEBSOCKET_MANAGER);

    ws.onmessage = ( ev : MessageEvent ) => {
        handler.handleMessage( JSON.parse(ev.data) )
    }

    ws.onopen = ( ev : MessageEvent ) => 
    {
        let req : models.Action< serverActions.scrape.WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS > = 
        {
            type: serverActions.scrape.WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS,
            payload: 
            {
                enable : true,
                token : ''
            }
        }
        ws.send( JSON.stringify( req ) );
    }

}

export function disconnect()
{
    if (ws != null)
    {
        ws.close();
        ws = null;
    }

}