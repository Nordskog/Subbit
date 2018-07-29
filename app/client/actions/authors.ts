import { State } from '~/client/store';

import { AuthorFilter, LoadingStatus } from '~/common/models';
import * as Redux from 'redux';
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

import * as authority from '~/client/authority'
import { CancellationError } from 'bluebird';
import { CancelledException, NetworkException, Exception } from '~/common/exceptions';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { WrapWithHandler } from '~/client/actions/tools/error';
import author from '~/client/components/author/container';

export function changeSubreddit( subreddit : string)
{
    return async function (dispatch : Dispatch, getState : GetState)
    {    
        if (subreddit == null)
        {
            //No sub means home (frontpage)
            dispatch(
                { type: actions.types.Route.HOME, payload: { } } 
                );
        }
        else
        {
            let state: State = getState();

            dispatch(
            { type: actions.types.Route.SUBREDDIT, payload: { subreddit: subreddit, filter: null  } as actions.types.Route.SUBREDDIT } 
            );
        }
    }
}

export function changeFilter( filter : AuthorFilter, subreddit? : string)
{
    return async function (dispatch : Dispatch, getState : GetState)
    {    
        if (subreddit == null)
        {
            dispatch(
                        { type: actions.types.Route.FILTER, payload: { filter: filter } as actions.types.Route.FILTER  } 
                );
        }
        else
        {
            let state: State = getState();

            dispatch(
            { type: actions.types.Route.SUBREDDIT, payload: { subreddit: subreddit, filter: filter  } as actions.types.Route.SUBREDDIT } 
            );
        }
    }
}

export function viewAuthor( author: string, subreddit? : string)
{
    return async function (dispatch : Dispatch, getState : GetState)
    {
       let state: State = getState();
    
        dispatch(
        { type: actions.types.Route.AUTHOR, payload: { author: author, subreddit: subreddit  } as actions.types.Route.AUTHOR } 
        );
    }
}

export function fetchAuthorsAction ( appendResults: boolean = false, loadFromSession : boolean = false, loadFromHistory : boolean = false)
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        try
        {
            let  authorEntries : models.data.AuthorEntry[];
            let after : string;

            //////////////////////////////////////////////
            // Load from history or session if present
            //////////////////////////////////////////////

            {
                //////////////////////
                // History
                //////////////////////
                if (loadFromHistory)
                {
                    authorEntries = actions.directActions.history.loadAuthors();
                    after = actions.directActions.history.loadAfter();

                    //Save this to session
                    if (authorEntries != null)
                        actions.directActions.session.saveAuthors(authorEntries, after);
                    
                }

                //////////////////////////
                // Session
                //////////////////////////
                if (authorEntries == null && loadFromSession)
                {
                    authorEntries = actions.directActions.session.loadAuthors();
                    after = actions.directActions.session.loadAfter();

                    //Save this to history
                    if (authorEntries != null)
                    {
                        actions.directActions.history.saveAuthors( authorEntries, after );
                    }
                }
            }

            //getAuthors() normally handles adding to authority, but do it here manually if loading from storage.
            if (authorEntries != null)
            {
                authorEntries.forEach( ( author : models.data.AuthorEntry ) => { authority.author.updateAuthority(author.author) } );
            }

            //////////////////////////////////
            // Fetch from reddit if still null
            //////////////////////////////////
        
            if (authorEntries == null)
            {
                dispatch
                ({ 
                        type: actions.types.page.LOADING_STATE_CHANGED,
                        payload: 
                        { 
                            status: LoadingStatus.LOADING, 
                        } as actions.types.page.LOADING_STATE_CHANGED
                });
    
                let authorData = await actions.directActions.authors.getAuthors(dispatch, getState);
                authorEntries = authorData.authorEntries;
                after = authorData.after;

                //Save to session storage so we can display without reloading
                {
                        if (appendResults)
                        {
                            actions.directActions.session.saveAuthors( getState().authorState.authors.concat(authorEntries), after);
                            actions.directActions.history.saveAuthors( getState().authorState.authors.concat(authorEntries), after );
                        }
                        else
                        {
                            actions.directActions.session.saveAuthors(authorEntries, after);
                            actions.directActions.history.saveAuthors( authorEntries, after );
                        }
                }
            }

            dispatch({
                type: actions.types.page.LOADING_STATE_CHANGED,
                payload: 
                { 
                    status: after == null ? LoadingStatus.END : LoadingStatus.DONE,

                }  as actions.types.page.LOADING_STATE_CHANGED
            });

            //Dispatch newly loaded authors
            dispatch({
                type: actions.types.authors.FETCH_AUTHORS_COMPLETED,
                payload: { authors: authorEntries,
                           end: after == null,
                           append: appendResults,
                           after: after
                }  as actions.types.authors.FETCH_AUTHORS_COMPLETED
            });


        }
        catch ( error )
        {
            if ( error instanceof CancelledException)
            {
                //Expected
            }
            else
            {
                //Kill any remaining requests
                api.cancelAll();

                dispatch({
                    type: actions.types.page.LOADING_STATE_CHANGED,
                    payload: 
                    { 
                        status: LoadingStatus.ERROR,
    
                    }  as actions.types.page.LOADING_STATE_CHANGED
                });

                if ( error instanceof NetworkException)
                {
                    //Reddit's servers are melting
                    if ( error.code == 500 )
                    {
                        throw new Exception("Reddit: Internal Server Error");
                    }
                    else
                    {
                        throw(error);
                    }
                }
                else
                {
                    throw(error);
                }

                
            }
        }
    });
}

//Ignores after
export function fetchPosts( author : models.data.AuthorEntry, count : number )
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();

        let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, state);

        let subreddits : string[] = [];
        if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
        {
            //Well that shouldn't happen
            if (author.subscription == null)
                return;

            subreddits = author.subscription.subreddits.map( (subreddit : models.data.SubscriptionSubreddit) => 
            {
                return subreddit.name;
            } )
        }
        else
        {
            if (state.authorState.subreddit != null)
            subreddits = [state.authorState.subreddit];
        }


        let {posts, after} = await api.reddit.posts.getPosts(author.author.name, null, redditAuth, count, ...subreddits)
        
        dispatch({
            type: actions.types.authors.POSTS_ADDED,
            payload: { 
                author: author.author.name,
                posts: posts,
                after: after,
                end: after == null,
                replace: true  
            }  as actions.types.authors.POSTS_ADDED
        });

    });
}

//Respects after
export function fetchMorePosts( authors : models.data.AuthorEntry[], count : number )
{
    return WrapWithHandler( async function (dispatch : Dispatch, getState : GetState)
    {
        let state: State = getState();

        let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, state);

        let proms : Promise<void>[] = [];
        authors.forEach( ( author : models.data.AuthorEntry ) => 
        {

            let subreddits : string[] = [];
            if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
            {
                //Well that shouldn't happen
                if (author.subscription == null)
                    return;

                subreddits = author.subscription.subreddits.map( (subreddit : models.data.SubscriptionSubreddit) => 
                {
                    return subreddit.name;
                } )
            }
            else
            {
                if (state.authorState.subreddit != null)
                subreddits = [state.authorState.subreddit];
            }

            let prom = new Promise<void>( (resolve, reject) => 
            {
                api.reddit.posts.getPosts(author.author.name, author.after, redditAuth, count, ...subreddits).then( ( {posts, after } ) => 
                {    
                    dispatch({
                        type: actions.types.authors.POSTS_ADDED,
                        payload: { 
                            author: author.author.name,
                            posts: posts,
                            after: after,
                            end: after == null,
                            replace: false
                        }  as actions.types.authors.POSTS_ADDED
                    });

                    resolve();
                });
            });

            proms.push(prom);

        });

        //Process any remaining
        await Promise.all(proms);
    });
}