export import auth = require('./auth');
export import data = require('./data');
export import state = require('./state');
export import reddit = require('./reddit');
export * from './Action';

export enum ScrapeType
    {
        PUSHSHIFT = 'pushshift',
        REDDIT = 'reddit',
    };

export enum ScrapeStatus
{
    PENDING = 'pending',
    WORKING = 'working',
    FINISHED = 'finished',
    ERROR = 'error',
    CANCELLED = 'cancelled',
    NEVER_RUN = 'never run',
    MODIFIED = 'modified'
};

export enum SocketAction
{
    REDUCER_ACTION = 'REDUCER_ACTION',
    TOAST = 'TOAST',
};

export enum AuthorFilter
    {
        BEST = 'best',
        NEW = 'new',
        HOT =  'hot',
        TOP = 'top',
        SUBSCRIPTIONS =  'subs',
    };