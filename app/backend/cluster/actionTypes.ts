import * as Http from 'http';
import * as Net from 'net';
import { Severity } from '~/common/log';
import { models } from '~/common';

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

export namespace auth
{
    export const ADD_AUTH_STATE               : string =  'ADD_AUTH_STATE';
    export const REMOVE_AUTH_STATE               : string =  'REMOVE_AUTH_STATE';
    
    export interface ADD_AUTH_STATE
    {
        loginType: models.auth.LoginType;
        identifier: string;
        expiresAt: number;

        sourceWorker : number;
    }

    export interface REMOVE_AUTH_STATE
    {
        identifier: string;
        sourceWorker : number;
    }
}