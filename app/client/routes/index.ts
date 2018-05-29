import * as actions from '~/client/actions';
import { AuthorFilter } from '~/common/models';

export const routesMap = {

    //Author
    HOME: { path: '/', thunk: actions.routes.authorsRoutes() }, 
    FILTER: { path: '/:filter', thunk: actions.routes.authorsRoutes() },   
    SUBREDDIT: { path: '/r/:subreddit/:filter?', thunk: actions.routes.authorsRoutes() },
    AUTHOR: { path: '/author/:author/:subreddit?', thunk: actions.routes.authorsRoutes() },

    //Manage
    MANAGER: { path: '/manager', thunk: actions.routes.managerRoutes() },   

    //Auth
    AUTHENTICATE: { path: '/authenticate', thunk: actions.routes.authorizeRoute() },
};

export enum Route
{
    HOME = "HOME",
    SUBREDDIT = "SUBREDDIT",
    AUTHOR = "AUTHOR",
    MANAGER = "MANAGER",
    AUTHENTICATE = "AUTHENTICATE",
}
