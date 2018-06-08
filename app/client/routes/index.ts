import * as actions from '~/client/actions';
import { AuthorFilter } from '~/common/models';

export const routesMap = {

    //Auth //If last route in map, the HOME route is triggered instead. Something is very broken with RFR
    AUTHENTICATE: { path: '/authenticate', thunk: actions.routes.authorizeRoute() },

    //Author
    HOME: { path: '/', thunk: actions.routes.authorsRoutes() }, 
    FILTER: { path: '/:filter', thunk: actions.routes.authorsRoutes() },   
    SUBREDDIT: { path: '/r/:subreddit/:filter?', thunk: actions.routes.authorsRoutes() },
    AUTHOR: { path: '/author/:author/:subreddit?', thunk: actions.routes.authorsRoutes() },
};

/*
export enum Route
{
    HOME = "HOME",
    FILTER= "FILTER",
    SUBREDDIT = "SUBREDDIT",
    AUTHOR = "AUTHOR",
    AUTHENTICATE = "AUTHENTICATE",
}
*/

export namespace Route
{
    export const HOME           : string = "HOME";
    export const FILTER         : string = "FILTER";
    export const SUBREDDIT      : string = "SUBREDDIT";
    export const AUTHOR         : string = "AUTHOR";
    export const AUTHENTICATE   : string = "AUTHENTICATE";

    export interface HOME 
    {

    };

    export interface FILTER
    {
        filter : AuthorFilter;
    }

    export interface SUBREDDIT
    {
        subreddit: string;
        filter?: AuthorFilter;
    }

    export interface AUTHOR
    {
        author: string;
        subreddit?: string;
    }

    export interface AUTHENTICATE 
    {
        //Uses params
    };
}
