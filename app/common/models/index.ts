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

export enum PostDisplay
{
    COMPACT = 'compact',
    NORMAL = 'normal'
}

export enum LoadingStatus
{
    LOADING = "loading",
    END = "end",
    EMPTY = "empty",
    ERROR = "error",
    DONE = "done"
}