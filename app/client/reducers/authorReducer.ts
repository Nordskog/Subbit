
import {Route} from '~/client/routes';

import { AuthorFilter } from '~/common/models';
import * as models from '~/common/models';
import * as actions from '~/client/actions';

export function authorReducer(state: models.state.AuthorsState = getDefaultAuthorState(), action : models.Action<any>)

{
    switch (action.type)
    {
        case actions.types.authors.FETCH_AUTHORS_COMPLETED:
        {
            action = action as models.Action< actions.types.authors.FETCH_AUTHORS_COMPLETED >;

            if (action.payload.append)
            {
                return {
                    ...state,
                    authors: state.authors.concat(action.payload.authors),
                    after: action.payload.after

                }
            }
            else
            {
                return {
                    ...state,
                    authors: action.payload.authors,
                    after: action.payload.after
                }
            }
        }
        case actions.types.authors.POSTS_ADDED:
        {

            action = action as models.Action< actions.types.authors.POSTS_ADDED >;

            return {
                ...state,
                authors: state.authors.map( author => 
                    {
                        if (author.author.name == action.payload.author )
                        {
                            return {
                                ...author,
                                author: {
                                    ...author.author,
                                    posts: author.author.posts.concat(action.payload.posts)
                                },
                                after: action.payload.after,
                                end: action.payload.end
                            }
                        }
                        else
                            return author;
                    })
            }
        }
        case actions.types.authors.POST_DETAILS_UPDATED:
        {
            action = action as models.Action< actions.types.authors.FETCH_AUTHORS_COMPLETED >;

            return {
                ...state,
                authors: state.authors.map( author => 
                    {
                        if (action.payload.has(author.author.name))
                        {
                            return {
                                ...author
                            }
                        }
                        else
                            return author;
                    })
            }
        }
        case actions.types.subscription.SUBSCRIPTION_CHANGED:
        case actions.types.subscription.SUBSCRIPTION_ADDED:
            {
                action = action as models.Action< actions.types.subscription.SUBSCRIPTION_ADDED >;

                return {
                    ...state,
                    authors: state.authors.map( author =>
                    {
                        if (author.author.name === action.payload.author)
                        {

                            return {
                                        ...author,
                                        subscription: action.payload
                            }
                        }
                        else
                            return author;
                    })
                }
            }
        case actions.types.subscription.SUBSCRIPTION_REMOVED:
        {
            let payload : actions.types.subscription.SUBSCRIPTION_REMOVED = action.payload;

            //When a subscription is removed we removed it from everywhere else, but only mark it as
            //unsubscribed in the authorEntry. This way the user can re-subscribe without losing the subreddits.

            return {
                ...state,
                authors: state.authors.map( author =>
                {
                    if (author.subscription && author.subscription.id === action.payload.id)
                    {
                        return {
                                    ...author,
                                    subscription: {
                                        ...author.subscription,
                                        subscribed : false
                                    
                                    }
                        }
                    }
                    else
                        return author;
                })
            }
        }

        case actions.types.authors.SUBREDDIT_CHANGED:
        {
            action = action as models.Action< actions.types.authors.SUBREDDIT_CHANGED >;

            return {
                ...state,
                subreddit: action.payload,
                after: null
                }
            
        }

        ////////////////
        // Page
        ////////////////

        case actions.types.page.NEW_PAGE:
        {
            let payload : actions.types.page.NEW_PAGE = action.payload;

            return {
                ...state,
                authors: []
            }
        }

        ///////////////
        //   ROUTE  //
        //////////////

        case Route.AUTHENTICATE:
        {
            //subs for now, auth reducer does the heavy lifting
            return {
                ...state,
                filter: AuthorFilter.SUBSCRIPTIONS,
                subreddit: null,
                author: null,
                after: null
            }
        }

        case Route.HOME:
        {
            return {
                ...state,
                filter: AuthorFilter.BEST,
                subreddit: null,
                author: null,
                after: null
            }
        }

        case Route.FILTER:
        {
            let payload : Route.FILTER = action.payload;

            return {
                ...state,
                filter: payload.filter,
                subreddit: null,
                author: null,
                after: null
            }
        }
        
        case Route.SUBREDDIT:
        {           
            let payload : Route.SUBREDDIT = action.payload;
            
            return {
                ...state,
                filter: payload.filter != null ? payload.filter : AuthorFilter.HOT,
                subreddit: action.payload.subreddit,
                author: null,
                after: null
            }
        }

        case Route.AUTHOR:
        {
            let payload : Route.AUTHOR = action.payload;

            return {
                ...state,
                filter: null,
                subreddit: payload.subreddit,
                author: payload.author,
                after: null
            }
        }
    }

    return state;
}

export function getDefaultAuthorState()
{
    return {
        authors: [],
        filter: AuthorFilter.NEW,
        author: null,
        subreddit: null,
        after : null
    } as models.state.AuthorsState ;
}