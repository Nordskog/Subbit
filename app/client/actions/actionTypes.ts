import * as models from '~/common/models'

export namespace authors
{
    export const FETCH_AUTHORS_COMPLETED    : string = 'FETCH_AUTHORS_COMPLETED';
    export const POST_DETAILS_UPDATED       : string = 'POST_DETAILS_UPDATED';
    export const SUBREDDIT_CHANGED          : string = 'SUBREDDIT_CHANGED';
    export const POSTS_ADDED                : string = 'POSTS_ADDED';

    export interface FETCH_AUTHORS_COMPLETED
    {
        authors: models.data.AuthorEntry[]
        append: boolean;
        page : number;
        end : boolean;
        after : string;
    }

    export type POST_DETAILS_UPDATED = Set<string>

    export type SUBREDDIT_CHANGED = string;

    export interface POSTS_ADDED
    {
        author: string;
        posts: models.reddit.Post[];
        after?: string;
        end: boolean;

    }
};

export namespace authentication
{
    export const LOGIN_SUCCESS         : string = 'LOGIN_SUCCESS';
    export const LOGOUT_SUCCESS         : string = 'LOGOUT_SUCCESS';
    export const REDDIT_TOKEN_UPDATED   : string =  'REDDIT_TOKEN_UPDATED';

    export interface LOGIN_SUCCESS extends models.auth.UserInfo
    {

    }

    export interface LOGOUT_SUCCESS
    {

    }

    export interface REDDIT_TOKEN_UPDATED extends models.auth.RedditAuth
    {

    }
};

export namespace subscription
{
    export const SUBSCRIPTIONS_FETCHED     : string = 'SUBSCRIPTIONS_FETCHED';
    export const SUBSCRIPTION_ADDED     : string = 'SUBSCRIPTION_ADDED';
    export const SUBSCRIPTION_REMOVED   : string = 'SUBSCRIPTION_REMOVED';
    export const SUBSCRIPTION_CHANGED   : string = 'SUBSCRIPTION_CHANGED';

    export type SUBSCRIPTIONS_FETCHED = models.data.Subscription[];

    export interface SUBSCRIPTION_ADDED extends Partial<models.data.Subscription>
    {   
        id: number;
        author: string;
    }

    export interface SUBSCRIPTION_CHANGED extends SUBSCRIPTION_ADDED
    {   

    }

    export interface SUBSCRIPTION_REMOVED
    {   
        id: number;
    }


    
};

export namespace site
{


};

export namespace manager
{
    export const FETCH_SUBREDDITS_COMPLETED : string = 'FETCH_SUBREDDITS_COMPLETED';
    export const SCRAPE_JOBS_UPDATED: string =  'SCRAPE_JOBS_UPDATED';
    export const SCRAPE_BOT_UPDATED: string =  'SCRAPE_BOT_UPDATED';
    export const SUBREDDIT_ADDED: string =  'SUBREDDIT_ADDED';
    export const SUBREDDIT_REMOVED: string =  'SUBREDDIT_REMOVED';
    export const SETTINGS_CHANGED: string =  'SETTINGS_CHANGED';
    export const SUBREDDIT_MODIFIED: string =  'SUBREDDIT_MODIFIED';

    export type FETCH_SUBREDDITS_COMPLETED = models.data.Subreddit[];
    export type SCRAPE_JOBS_UPDATED = models.data.ScrapeJob[]
    export interface SETTINGS_CHANGED extends Partial<models.data.Settings>
    {

    }
    export interface SUBREDDIT_MODIFIED extends Partial<models.data.Subreddit>
    {
        id : number
    }
    export interface SUBREDDIT_ADDED extends models.data.Subreddit
    {
   
    }
    export interface SUBREDDIT_REMOVED
    {
        id: number;
    }
    export interface SCRAPE_BOT_UPDATED extends Partial<models.data.ScrapeBot>
    {
      
    }
};