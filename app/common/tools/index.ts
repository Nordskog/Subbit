export import store = require('./store');
export import time = require('./time');
export import url = require('./url');
export import number = require('./number');
export import jwt = require('./jwt');
export import query = require('./query');
export import reddit = require('./reddit');
export {default as FetchQueue, RateLimitInfo as RateLimitInfo} from './FetchQueue'
export import IntervalBot = require('./IntervalBot');
export import css = require('./css');

export function removeNullChars(str : string)
{
    return str.replace('\u0000', '');
}