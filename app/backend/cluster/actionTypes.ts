import * as Http from 'http';
import * as Net from 'net';
import { Severity } from '~/common/log';
import { models } from '~/common';
import { StatsCategoryType } from '~/common/models/stats';
// tslint:disable:class-name
// tslint:disable:ban-types

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

export namespace stats
{
    export const ADD_STATS               : string =  'ADD_STATS';
    
    export interface ADD_STATS
    {
       category: StatsCategoryType;
       value? : number;
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
