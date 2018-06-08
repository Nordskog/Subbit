export import auth = require('./auth');
export import data = require('./data');
export import state = require('./state');
export import reddit = require('./reddit');
export * from './Action';

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