import * as Http from 'http';
import * as Net from 'net';
import { Severity } from '~/common/log';

export namespace websocket
{
    export const UPGRADE_CONNECTION               : string =  'UPGRADE_CONNECTION';
    
    export interface UPGRADE_CONNECTION
    {
        request : Partial<Http.IncomingMessage>;
    }

    export interface UPGRADE_CONNECTION_HANDLE
    {
        socket : Net.Socket;
    }
}

export namespace log
{
    export const LOG               : string =  'LOG';
    
    export interface LOG
    {
       severity: Severity;
       msg : any;
       meta: Object;
    }


}