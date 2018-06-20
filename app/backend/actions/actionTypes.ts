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

export namespace auth
{
    export const AUTHENTICATE_WITH_REDDIT_CODE: string = 'AUTHENTICATE_WITH_REDDIT_CODE'
    export const UNAUTHORIZE_ALL_DEVICES: string = 'UNAUTHORIZE_ALL_DEVICES'

    export interface UNAUTHORIZE_ALL_DEVICES
    {
        
    }

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