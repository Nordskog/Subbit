import * as models from '~/common/models'

export namespace subscription
{
    export const ADD_SUBSCRIPTION               : string =  'ADD_SUBSCRIPTION';
    export const REMOVE_SUBSCRIPTION            : string =  'REMOVE_SUBSCRIPTION';
    export const ADD_SUBSCRIPTION_SUBREDDIT     : string =  'ADD_SUBSCRIPTION_SUBREDDIT';
    export const REMOVE_SUBSCRIPTION_SUBREDDIT  : string =  'REMOVE_SUBSCRIPTION_SUBREDDIT';


    export interface ADD_SUBSCRIPTION
    {
        user : string;
        author : string;
        subreddits : string[];
    }

    export interface REMOVE_SUBSCRIPTION
    {
        id : number;
    }

    export interface ADD_SUBSCRIPTION_SUBREDDIT
    {
        id : number;
        subreddit : string;
    }

    export interface REMOVE_SUBSCRIPTION_SUBREDDIT
    {
        id : number;
        subreddit : string;
    }
}

export namespace subreddit
{
    export const ADD_SUBREDDIT          : string = 'ADD_SUBREDDIT';
    export const REMOVE_SUBREDDIT       : string = 'REMOVE_SUBREDDIT';
    export const SET_AUTO_SCRAPE_STATE  : string = 'SET_AUTO_SCRAPE_STATE';

    export interface ADD_SUBREDDIT
    {
        subreddit: string;
    }

    export interface REMOVE_SUBREDDIT
    {
        id: number;
    }

    export interface SET_AUTO_SCRAPE_STATE
    {
        id : number;
        enabled: boolean;
    }
}

export namespace post
{
    export const UPDATE_POST_HOT_SCORE          : string = 'UPDATE_POST_HOT_SCORE';

    export interface UPDATE_POST_HOT_SCORE
    {
        subreddit_id?: number;
        until?: number;
    }
}

export namespace author
{
    export const PRUNE_AUTHORS_WITH_NO_POSTS: string = 'PRUNE_AUTHORS_WITH_NO_POSTS'
    export const UPDATE_AUTHOR_HOT_SCORE_FROM_POSTS: string = 'UPDATE_AUTHOR_HOT_SCORE_FROM_POSTS'

    export interface PRUNE_AUTHORS_WITH_NO_POSTS
    {
        subreddit_id?: number;
    }

    export interface UPDATE_AUTHOR_HOT_SCORE_FROM_POSTS
    {
        subreddit_id?: number;
        until?: number;
    }
}

export namespace auth
{
    export const AUTHENTICATE_WITH_REDDIT_CODE: string = 'AUTHENTICATE_WITH_REDDIT_CODE'

    export interface AUTHENTICATE_WITH_REDDIT_CODE
    {
        code: string;
        state: string;
    }
}

export namespace user
{
    export const SET_SETTING_POST_DISPLAY_MODE: string = 'SET_SETTING_POST_DISPLAY_MODE'

    export interface SET_SETTING_POST_DISPLAY_MODE
    {
        mode: models.PostDisplay;
    }
}

export namespace scrape
{
        export const REQUEST_SCRAPE                     : string = 'REQUEST_SCRAPE';
        export const CANCEL_SCRAPE                      : string = 'CANCEL_SCRAPE';
        export const SET_AUTOSCRAPE                     : string = 'SET_AUTOSCRAPE';
        export const SET_AUTOSCRAPE_INTERVAL            : string = 'SET_AUTOSCRAPE_INTERVAL';
        export const WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS  : string = 'WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS';
        export const SET_AUTOSCRAPE_CONCURRENT_REQUESTS : string = 'SET_AUTOSCRAPE_CONCURRENT_REQUESTS';
        export const RUN_AUTOSCRAPE_NOW                 : string = 'RUN_AUTOSCRAPE_NOW';

        export interface WEBSOCKET_SUBSCRIBE_TO_JOB_STATUS
        {
            token : string,
            enable: boolean
        }

        export interface REQUEST_SCRAPE
        {
            scrape_from_time: number;
            scrape_to_time : number;
            subreddit : string;
            scrape_type : models.ScrapeType;
        }

        export interface CANCEL_SCRAPE
        {
                id: number;
        }

        export interface SET_AUTOSCRAPE
        {
                enabled: boolean;
        }

        export interface SET_AUTOSCRAPE_INTERVAL
        {
                interval: number;
        }

        export interface SET_AUTOSCRAPE_CONCURRENT_REQUESTS
        {
                concurrent_requests: number;
        }

        export interface RUN_AUTOSCRAPE_NOW
        {
               
        }
}