import * as actions from '~/client/actions';

export const routesMap = {

    //Author
    HOME: { path: '/', thunk: actions.routes.authorsRoutes() },
    NEW: { path: '/new', thunk: actions.routes.authorsRoutes() },      
    HOT: { path: '/hot', thunk: actions.routes.authorsRoutes() },     
    SUBS: { path: '/subs', thunk: actions.routes.authorsRoutes() },
    SUBREDDIT: { path: '/r/:subreddit/:filter?', thunk: actions.routes.authorsRoutes() },
    AUTHOR: { path: '/author/:author', thunk: actions.routes.authorsRoutes() },

    //Manage
    MANAGER: { path: '/manager', thunk: actions.routes.managerRoutes() },   

};
