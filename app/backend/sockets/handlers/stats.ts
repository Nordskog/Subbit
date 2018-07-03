import * as WebSocket from 'ws'; 
import * as entities from '~/backend/entity'
import * as models from '~/common/models'
import * as actions from '~/client/actions'
import * as api from '~/common/api'

const subscribedSockets : Set<WebSocket> = new Set<WebSocket>();

export function addSubscriber( ws : WebSocket)
{
    subscribedSockets.add(ws);
}

export function removeSubscriber( ws : WebSocket)
{
    subscribedSockets.delete(ws);
}


export function dispatch( action : models.Action<any>  )
{
    for ( let socket of subscribedSockets )
    {
        socket.send( JSON.stringify( action  ) );
    }

}
