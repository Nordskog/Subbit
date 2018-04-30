
import * as routes from '~/client/routes';

import * as viewFilters from '~/common/viewFilters';
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
                    authors: state.authors.concat(action.payload.authors)
                }
            }
            else
            {
                return {
                    ...state,
                    authors: action.payload.authors
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
                        if (author.author.id == action.payload.authorId )
                        {
                            return {
                                ...author,
                                author: {
                                    ...author.author,
                                    posts: author.author.posts.concat(action.payload.posts)
                                }
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
                        if (action.payload.has(author.author.id))
                        {

                            console.log("Redrawing ",author.author.name);

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

            action = action as models.Action< actions.types.subscription.SUBSCRIPTION_REMOVED >;

            return {
                ...state,
                authors: state.authors.map( author =>
                {
                    if (author.subscription && author.subscription.id === action.payload.id)
                    {
                        return {
                                    ...author,
                                    subscription: null
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
                subreddit: action.payload
                }
            
        }

        ///////////////
        //   ROUTE  //
        //////////////

        
        case 'NEW':
            {
                
                return {
                    ...state,
                    filter: viewFilters.authorFilter.NEW,
                    subreddit: null,
                    author: null
                }
            }

        case 'HOT':
        {
            
            return {
                ...state,
                filter: viewFilters.authorFilter.HOT,
                subreddit: null,
                author: null
            }
        }

        case 'HOME':
        case 'SUBS':
            {
                return {
                    ...state,
                    filter: viewFilters.authorFilter.SUBSCRIPTIONS,
                    subreddit: null,
                    author: null
                }
            }

            case 'SUBREDDIT':
            {                
                return {
                    ...state,
                    filter: action.payload.filter != null ? action.payload.filter : viewFilters.authorFilter.HOT,
                    subreddit: action.payload.subreddit,
                    author: null
                }
            }

            case 'AUTHOR':
            {
                return {
                    ...state,
                    filter: viewFilters.authorFilter.NEW,
                    subreddit: null,
                    author: action.payload.author
                }
            }
    }

    return state;
}

export function getDefaultAuthorState()
{
    return {
        authors: [],
        filter: viewFilters.authorFilter.NEW,
        author: null,
        subreddit: null
    };
}