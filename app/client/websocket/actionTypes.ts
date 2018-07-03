import * as statsModels from '~/common/models/stats';

export namespace auth 
{
    export const AUTHENTICATED: string = 'AUTHENTICATED'
    export interface AUTHENTICATED
    {

    }
}

export namespace stats
{
    export const STATS_UPDATE: string = 'STATS_UPDATE'
    export const STATS_HISTORY: string = 'STATS_HISTORY'

    export interface STATS_UPDATE extends statsModels.StatsUpdate
    {
        
    }

    export interface STATS_HISTORY extends statsModels.StatsHistory
    {
        
    }
}

export namespace errors 
{
    export const ERROR: string = 'ERROR'

    export interface ERROR
    {
        message : string;
    }
}

export const PONG: string = 'PONG';
export interface PONG { };