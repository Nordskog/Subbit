
import * as actions from './actions';
import * as models from '~/common/models';
import * as socket from '~/client/websocket/socket'

const SOCKET_TIMEOUT : number = 1000 * 10; //10 seconds

let pingPongTimeout = null;
let pingPongInterval = null;
let awaitingPong : boolean = false;

export function startPingPong()
{
    //Stop if already running
    stopPingPong();

    pingPongInterval = setInterval( () => 
    {   
        //Send ping
        startPongTimeout();  
        actions.ping();
        
    }, SOCKET_TIMEOUT);   
}

export function stopPingPong()
{
    if (pingPongInterval != null)
    {
        awaitingPong = false;
        clearInterval(pingPongInterval);
        pingPongInterval = null;
    }
}

function checkPong()
{
    if (awaitingPong)
    {
        //No pong received, reconnect!  
        actions.reconnect();
    }
    else 
    {
        //Pong received while we waited, all good.
    }
}

//Can also be called even when not connected to trigger a delayed reconnect
export function startPongTimeout()
{
    //Clear if already running.
    if (pingPongTimeout != null)
    {
        clearInterval(pingPongTimeout);
    }

    awaitingPong = false;
    if (socket.wantToBeOpen)
    {
        awaitingPong = true;
        pingPongTimeout = setTimeout( () => 
        {   
            checkPong();
    
        }, SOCKET_TIMEOUT);   
    }

}

export function reconnectDelayed()
{
    startPongTimeout();
}

export function notifyPong()
{
    if (pingPongTimeout != null)
    {
        awaitingPong = false;
        clearTimeout(pingPongTimeout);
        pingPongTimeout = null;
    }
}
