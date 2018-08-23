// tslint:disable:class-name

import * as models from '~/common/models';
import { LoadingStatus, AuthorFilter } from '~/common/models';

export namespace authors
{
    export const FETCH_AUTHORS_COMPLETED    : string = 'FETCH_AUTHORS_COMPLETED';
    export const POST_DETAILS_UPDATED       : string = 'POST_DETAILS_UPDATED';
    export const SUBREDDIT_CHANGED          : string = 'SUBREDDIT_CHANGED';
    export const SUBREDDIT_NAME_CHANGED          : string = 'SUBREDDIT_NAME_CHANGED';
    export const POSTS_ADDED                : string = 'POSTS_ADDED';

    export interface FETCH_AUTHORS_COMPLETED
    {
        authors: models.data.AuthorEntry[];
        append: boolean;
        page : number;
        end : boolean;
        after : string;
    }

    export type POST_DETAILS_UPDATED = Set<string>;

    export type SUBREDDIT_CHANGED = string;

    export type SUBREDDIT_NAME_CHANGED = string;

    export interface POSTS_ADDED
    {
        author: string;
        posts: models.reddit.Post[];
        after?: string;
        end: boolean;
        replace: boolean;
    }

}

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
}

export namespace subscription
{
    export const SUBSCRIPTIONS_FETCHED          : string = 'SUBSCRIPTIONS_FETCHED';
    export const SUBSCRIPTION_ADDED             : string = 'SUBSCRIPTION_ADDED';
    export const SUBSCRIPTION_REMOVED           : string = 'SUBSCRIPTION_REMOVED';
    export const SUBSCRIPTION_CHANGED           : string = 'SUBSCRIPTION_CHANGED';
    export const TEMPORARY_SUBSCRIPTION_ADDED   : string = 'TEMPORARY_SUBSCRIPTION_ADDED';

    export type SUBSCRIPTIONS_FETCHED = models.data.Subscription[];

    export interface SUBSCRIPTION_ADDED extends Partial<models.data.Subscription>
    {   
        id: number;
        author: string;
    }

    export interface SUBSCRIPTION_CHANGED extends SUBSCRIPTION_ADDED
    {   

    }

    export interface TEMPORARY_SUBSCRIPTION_ADDED extends SUBSCRIPTION_ADDED
    {   

    }

    export interface SUBSCRIPTION_REMOVED
    {   
        id: number;
    }
}

export namespace page
{
    export const NEW_PAGE                       : string = 'NEW_PAGE';
    export const LOADING_PROGRESS               : string = 'LOADING_PROGRESS';
    export const LOADING_STATE_CHANGED              : string = 'LOADING_STATE_CHANGED';

    export interface NEW_PAGE
    {   
        status: LoadingStatus;
    }

    export interface LOADING_PROGRESS
    {
        loadingProgress: number;
        loadingCount: number;
    }

    export interface LOADING_STATE_CHANGED
    {
        status: models.LoadingStatus;
    }

}

export namespace user
{
    export const POST_DISPLAY_MODE_CHANGED: string =  'POST_DISPLAY_MODE_CHANGED';
    export const LAST_VISIT_UPDATED: string = "LAST_VISIT_UPDATED";
    export const USER_SETTINGS_FETCHED: string = "USER_SETTINGS_UPDATED";

    export type POST_DISPLAY_MODE_CHANGED = models.PostDisplay;
    export type LAST_VISIT_UPDATED = number;
    export type USER_SETTINGS_FETCHED = models.data.UserSettings;
}

export namespace Route
{
    export const HOME           : string = "HOME";
    export const FILTER         : string = "FILTER";
    export const SUBREDDIT      : string = "SUBREDDIT";
    export const AUTHOR         : string = "AUTHOR";
    export const AUTHENTICATE   : string = "AUTHENTICATE";
    export const STATS          : string = "STATS";
    export const ABOUT          : string = "ABOUT";
    export const PRIVACY        : string = "PRIVACY";

    export interface ABOUT 
    {

    }

    export interface STATS 
    {

    }

    export interface HOME 
    {

    }

    export interface PRIVACY 
    {

    }

    export interface FILTER
    {
        filter : AuthorFilter;
        time? : models.PostTimeRange;   // Only for top
    }

    export interface SUBREDDIT
    {
        subreddit: string;
        filter?: AuthorFilter;
        time? : models.PostTimeRange;   // Only for top
    }

    export interface AUTHOR
    {
        author: string;
        subreddit?: string;
    }

    export interface AUTHENTICATE 
    {
        // Uses params
    }
}
