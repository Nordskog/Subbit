import * as WebSocket from 'ws'; 
export interface WsSocket extends WebSocket
{
    isAlive : boolean;
    ip : string;
}
