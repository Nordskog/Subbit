import * as auth from './auth';
import * as data from './data';
import * as state from './state';
import * as stats from './stats';
import * as reddit from './reddit';
export * from './Action';

export
{
    auth, data, state, stats, reddit
}

export enum AuthorFilter
{
    BEST = 'best',
    NEW = 'new',
    HOT =  'hot',
    TOP = 'top',
    SUBSCRIPTIONS =  'subs',
    RISING = "rising",
    CONTROVERSIAL = "controversial",
};

export enum PostTimeRange
{
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
    ALL = 'all',
}

export enum PostDisplay
{
    MINIMAL = 'minimal',
    COMPACT = 'compact',
    FULL = 'full'
}

export enum LoadingStatus
{
    LOADING = "loading",
    END = "end",
    EMPTY = "empty",
    ERROR = "error",
    DONE = "done"
}

export enum SiteMode
{
    AUTHORS, STATS, ABOUT, PRIVACY
}

export type WebsocketReconnectCallback = () => void;