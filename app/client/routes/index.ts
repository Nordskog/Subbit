﻿import * as actions from '~/client/actions';
import { AuthorFilter } from '~/common/models';

export const routesMap = {

    //Auth //If last route in map, the HOME route is triggered instead. Something is very broken with RFR
    AUTHENTICATE: { path: '/authenticate', thunk: actions.routes.authorizeRoute() },

    //Author
    HOME: { path: '/', thunk: actions.routes.authorsRoutes() }, 
    FILTER: { path: '/:filter/:time?', thunk: actions.routes.authorsRoutes() },   
    SUBREDDIT: { path: '/r/:subreddit/:filter?/:time?', thunk: actions.routes.authorsRoutes() },
    AUTHOR: { path: '/author/:author/:subreddit?', thunk: actions.routes.authorsRoutes() },
};
