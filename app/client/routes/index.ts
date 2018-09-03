import * as actions from '~/client/actions';
import { AuthorFilter } from '~/common/models';
import { RoutesMap } from 'redux-first-router';

export const routesMap : RoutesMap<any, any> = {

    // Auth //If last route in map, the HOME route is triggered instead. Something is very broken with RFR
    AUTHENTICATE: { path: '/authenticate', thunk: actions.routes.authorizeRoute() },

    STATS: { path: '/stats', thunk: actions.routes.statsRoute() },   

    IMPORT: { path: '/import', thunk: actions.routes.importRoute() }, 

    ABOUT: { path: '/about', thunk: actions.routes.aboutRoute() }, 
    PRIVACY: { path: '/privacy', thunk: actions.routes.aboutRoute() }, 

    // Author
    HOME: { path: '/', thunk: actions.routes.authorsRoutes() }, 
    SUBREDDIT: { path: '/r/:subreddit/:filter?/:time?', thunk: actions.routes.authorsRoutes() },
    AUTHOR: { path: '/author/:author/:subreddit?', thunk: actions.routes.authorsRoutes() },
    FILTER: { path: '/:filter/:time?', thunk: actions.routes.authorsRoutes() },   
    

};
