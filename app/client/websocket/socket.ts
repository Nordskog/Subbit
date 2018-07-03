
import * as urls from '~/common/urls'
import * as models from '~/common/models'
import * as handler from '~/client/websocket/handler'
import * as socketServerActions from '~/backend/sockets/actionTypes'
import config from 'root/config'
import * as keepAlive from './keepAlive';

let lastAccessToken : string;
let ws : WebSocket = null;
export let wantToBeOpen : boolean = false;
export let socketOpen : boolean = false;
let authenticated : boolean = false;
let awaitingOpen : ( () => any ) [] = []; 
let awaitingAuthentication : ( () => any ) [] = []; 

//Call when socket connects, is not cleared on unintentional disconnect
const connectListener : Set<models.WebsocketReconnectCallback> = new Set<models.WebsocketReconnectCallback>();

export function reconnect()
{
    if (wantToBeOpen)
    {
        clearState();
        connect(lastAccessToken);
    }
}

export function connect( access_token : string )
{
    //Calling connect means we want this to stay open
    wantToBeOpen = true;

    if (ws != null)
    {
        //Already connected.
        return;
    }

    //Queue up the transmitCredentials request before we connect
    //TODO update from store
    lastAccessToken = access_token; //Keep around incase we need to reconnect
    transmitCredentials(access_token);

    ws = new WebSocket( config.server.websocket_address );

    ws.onmessage = ( ev : MessageEvent ) => 
    {
        handler.handleMessage( JSON.parse(ev.data) )
    }

    ws.onopen = ( ev : MessageEvent ) => 
    {
        socketOpen = true;
        keepAlive.startPingPong();
        processAwaitingOpen();
        callOnConnectCallbacks();
    }

    
    ws.onerror = ( ev: Event ) =>
    {
        console.log("socket error: ", ev);
    }


    ws.onclose = ( ev : CloseEvent ) => 
    {
        clearState();

        //If socket was closed but we want to remain connected,
        //attempt reconnect after timeout.
        if (wantToBeOpen)
        {
            keepAlive.startPongTimeout(); 
        }
    }
}

export function notifyAuthenticated()
{
    authenticated = true;
    processAwaitingAuthentication();
}

function transmitCredentials( access_token : string )
{
    let req : models.Action< socketServerActions.auth.AUTHENTICATE > = 
    {
        type: socketServerActions.auth.AUTHENTICATE,
        payload: { access_token : access_token }
    }
    send(req);
    
}


export function send( data : any, authenticationRequired : boolean = false)
{
    if ( !authenticated && authenticationRequired)
    {
        sendOnAuthenticated(data);
    }
    else if (!socketOpen)
    {
        sendOnOpen( data );
    }
    else
    {
        ws.send( JSON.stringify( data ) );
    }
}

function sendOnOpen( data : any)
{
    awaitingOpen.push( data );
}

function sendOnAuthenticated( data : any)
{
    awaitingAuthentication.push( data );
}

function processAwaitingOpen()
{
    for ( let data of awaitingOpen)
    {
        ws.send( JSON.stringify( data ) );
    }

    awaitingOpen.length = 0;
}



function processAwaitingAuthentication()
{
    for ( let data of awaitingAuthentication)
    {
        ws.send( JSON.stringify( data ) );
    }

    awaitingAuthentication.length = 0;
}

export function disconnectIfInactive()
{
    if(!handler.listenersActive())
    {
        disconnect();
    }
}

//Clearing status because if disconnect.
//Does not mean we want to be disconnected.
function clearState()
{
    awaitingOpen.length = 0;
    awaitingAuthentication.length = 0;
    handler.cleanUp();
    keepAlive.stopPingPong();
    authenticated = false;
    socketOpen = false;
    if ( ws != null)
    {
        if ( ws.readyState != ws.CLOSED || ws.readyState != ws.CLOSING )
            ws.close();
        ws = null;
    }

}


export function disconnect()
{
    //Calling disconnect means we want this to stay closed
    wantToBeOpen = true;

    if (ws != null)
    {
        wantToBeOpen = false;
        clearState();
    }
}

export function addConnectCallback( callback : models.WebsocketReconnectCallback )
{
    //If socket is already alive call immediately
    if (socketOpen)
    {
        callback();
    }
    
    connectListener.add(callback);
}

export function removeConnectCallback( callback : models.WebsocketReconnectCallback )
{
    connectListener.delete(callback);
}

export function callOnConnectCallbacks()
{
    for( let callback of connectListener)
    {
        callback();
    }
}