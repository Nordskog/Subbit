﻿import { AuthorFilter } from '~/common/models';
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
                };
            }
            else
            {
                return {
                    ...state,
                    authors: action.payload.authors,
                    after: action.payload.after
                };
            }
        }
        case actions.types.authors.POSTS_ADDED:
        {
            let payload = action.payload as actions.types.authors.POSTS_ADDED;

            return {
                ...state,
                authors: state.authors.map( (author) => 
                    {
                        if (author.author.name === payload.author )
                        {
                            return {
                                ...author,
                                author: {
                                    ...author.author,
                                    posts: payload.replace ? payload.posts : author.author.posts.concat(payload.posts)
                                },
                                after: payload.after,
                                end: payload.end
                            };
                        }
                        else
                            return author;
                    })
            };
        }
        
        case actions.types.authors.POST_DETAILS_UPDATED:
        {
            action = action as models.Action< actions.types.authors.FETCH_AUTHORS_COMPLETED >;

            return {
                ...state,
                authors: state.authors.map( (author) => 
                    {
                        if (action.payload.has(author.author.name))
                        {
                            return {
                                ...author
                            };
                        }
                        else
                            return author;
                    })
            };
        }
        case actions.types.subscription.SUBSCRIPTION_CHANGED:
        case actions.types.subscription.SUBSCRIPTION_ADDED:
        case actions.types.subscription.TEMPORARY_SUBSCRIPTION_ADDED:
        {
            action = action as models.Action< actions.types.subscription.SUBSCRIPTION_ADDED >;

            return {
                ...state,
                authors: state.authors.map( (author) =>
                {
                    if (author.author.name === action.payload.author)
                    {

                        return {
                                    ...author,
                                    subscription: action.payload
                        };
                    }
                    else
                        return author;
                })
            };
        }

        // We usually replace the entire subscription with a new instance, 
        // but these wait for the server to respond and may be called out of order
        case actions.types.subscription.SUBSCRIPTION_SUBREDDIT_REMOVED:
        case actions.types.subscription.SUBSCRIPTION_SUBREDDIT_ADDED:
        {
            let payload : actions.types.subscription.SUBSCRIPTION_SUBREDDIT_REMOVED = action.payload;

            return {
                ...state,
                authors: state.authors.map( ( author ) =>
                {
                    if (author.subscription == null)
                        return author;

                    if (author.subscription.id === payload.id)
                    {
                        if (action.type === actions.types.subscription.SUBSCRIPTION_SUBREDDIT_REMOVED )
                        {
                            return {
                                ...author,
                                subscription: 
                                {
                                    ...author.subscription,
                                    subreddits: author.subscription.subreddits.filter( ( subreddit ) => subreddit.name !== payload.subreddit )
                                }

                            };
                        }

                        if (action.type === actions.types.subscription.SUBSCRIPTION_SUBREDDIT_ADDED )
                        {
                            return {
                                ...author,
                                subscription: 
                                {
                                    ...author.subscription,
                                    subreddits: author.subscription.subreddits.concat( { name: payload.subreddit, subscribed: true } )
                                }

                            };
                        }
                    }
                    else
                    {
                        return author;
                    }
                })
            };
        }

        case actions.types.subscription.SUBSCRIPTION_REMOVED:
        {
            let payload : actions.types.subscription.SUBSCRIPTION_REMOVED = action.payload;

            // When a subscription is removed we removed it from everywhere else, but only mark it as
            // unsubscribed in the authorEntry. This way the user can re-subscribe without losing the subreddits.

            return {
                ...state,
                authors: state.authors.map( (author) =>
                {
                    if (author.subscription && author.subscription.id === payload.id)
                    {
                        return {
                                    ...author,
                                    subscription: {
                                        ...author.subscription,
                                        subscribed : false
                                    
                                    }
                        };
                    }
                    else
                        return author;
                })
            };
        }

        case actions.types.authors.SUBREDDIT_CHANGED:
        {
            let payload : actions.types.authors.SUBREDDIT_CHANGED = action.payload;

            return {
                ...state,
                subreddit: payload,
                after: null
                };
            
        }

        case actions.types.authors.SUBREDDIT_NAME_CHANGED:
        {
            let payload : actions.types.authors.SUBREDDIT_NAME_CHANGED = action.payload;

            return {
                ...state,
                subreddit: payload
                };
            
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
            };
        }

        ///////////////
        //   ROUTE  //
        //////////////

        case actions.types.Route.AUTHENTICATE:
        {
            // subs for now, auth reducer does the heavy lifting
            return {
                ...state,
                filter: AuthorFilter.SUBSCRIPTIONS,
                subreddit: null,
                author: null,
                after: null,
                time: null
            };
        }

        case actions.types.Route.PRIVACY: 
        case actions.types.Route.ABOUT: 
        case actions.types.Route.STATS: 
        case actions.types.Route.HOME:
        {
            return {
                ...state,
                filter: AuthorFilter.SUBSCRIPTIONS,
                subreddit: null,
                author: null,
                after: null,
                time: null
            };
        }

        case actions.types.Route.IMPORT:
        {
            return {
                ...state,
                filter: AuthorFilter.IMPORTED,
                subreddit: null,
                author: null,
                after: null,
                time: null
            };
        }

        case actions.types.Route.FILTER:
        {
            let payload : actions.types.Route.FILTER = action.payload;

            return {
                ...state,
                filter: payload.filter,
                subreddit: null,
                author: null,
                after: null,
                time: payload.filter === AuthorFilter.TOP ? payload.time || models.PostTimeRange.ALL  : null
            };
        }
        
        case actions.types.Route.SUBREDDIT:
        {           
            let payload : actions.types.Route.SUBREDDIT = action.payload;
            
            return {
                ...state,
                filter: payload.filter != null ? payload.filter : AuthorFilter.HOT,
                subreddit: action.payload.subreddit,
                author: null,
                after: null,
                time: payload.filter === AuthorFilter.TOP ? payload.time || models.PostTimeRange.ALL : null
            };
        }

        case actions.types.Route.AUTHOR:
        {
            let payload : actions.types.Route.AUTHOR = action.payload;

            return {
                ...state,
                filter: null,
                subreddit: payload.subreddit,
                author: payload.author,
                after: null,
                time: null
            };
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
        after : null,
        time : null
    } as models.state.AuthorsState ;
}
