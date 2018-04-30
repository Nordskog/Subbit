import * as WebSocket from 'ws'; 
import * as serverActions from '~/backend/actions'
import * as authentication from '~/backend/authentication'
import * as models from '~/common/models'
import * as listeners from './listeners'

export function handleSocketMessage( ws : WebSocket, message : WebSocket.Data )
{
    let rawReq : models.Action< any > = JSON.parse(<string>message);

    switch(rawReq.type)
    {
        case serverActions.scrape.WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS:
        {
            let req : models.Action< serverActions.scrape.WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS  > = rawReq;
            
            //TODO check auth
            listeners.addSubscriber(ws);      
            break;
        }

        default:
        {
            console.log("Unknown action: "+rawReq.type);
            break;
        }
    }
    
}