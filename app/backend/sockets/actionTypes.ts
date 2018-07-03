import { StatsTimeRange, StatsCategoryType } from "~/backend/stats";

export namespace auth
{
    export const AUTHENTICATE: string = 'AUTHENTICATE'
    export interface AUTHENTICATE
    {
        access_token: string;
    }
}

export namespace stats
{
    export const SUBSCRIBE_TO_STATS: string = 'SUBSCRIBE_TO_STATS'
    export const UNSUBSCRIBE_FROM_STATS: string = 'UNSUBSCRIBE_FROM_STATS'
    export const REQUEST_STATS_HISTORY: string = 'REQUEST_STATS_HISTORY'

    export interface SUBSCRIBE_TO_STATS
    {
        
    }

    export interface UNSUBSCRIBE_FROM_STATS
    {

    }

    export interface REQUEST_STATS_HISTORY
    {
        category: StatsCategoryType,
        timeRange: StatsTimeRange;
    }
}

export const PING: string = 'PING';
export interface PING { };