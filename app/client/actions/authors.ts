import { State } from '~/client/store';

import { AuthorFilter, LoadingStatus } from '~/common/models';
import * as Redux from 'redux';
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'

import * as authority from '~/client/authority'
import { CancellationError } from 'bluebird';
import { CancelledException } from '~/common/exceptions';
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { WrapWithHandler } from '~/client/actions/tools/error';

export function changeSubreddit( subreddit : string)
{
    return async function (dispatch, getState)
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

            let filter = state.authorState.filter;
            if (filter == models.AuthorFilter.SUBSCRIPTIONS)
            {
                filter = null;
            }
            else if ( filter == AuthorFilter.BEST)
            {
                //subreddits only have hot or new
                filter = AuthorFilter.HOT;
            }
    
            dispatch(
            { type: actions.types.Route.SUBREDDIT, payload: { subreddit: subreddit, filter: filter  } as actions.types.Route.SUBREDDIT } 
            );
        }



    }
}

export function viewAuthor( author: string, subreddit? : string)
{
    return async function (dispatch, getState)
    {
       let state: State = getState();
    
        dispatch(
        { type: actions.types.Route.AUTHOR, payload: { author: author, subreddit: subreddit  } as actions.types.Route.AUTHOR } 
        );
    }
}

export function fetchAuthorsAction ( appendResults: boolean = false)
{
    return WrapWithHandler( async function (dispatch, getState)
    {
        try
        {
            let { authorEntries, after} = await actions.directActions.authors.getAuthors(dispatch, getState);

            dispatch({
                type: actions.types.authors.FETCH_AUTHORS_COMPLETED,
                payload: { authors: authorEntries,
                           end: after == null,
                           append: appendResults,
                           after: after
                }  as actions.types.authors.FETCH_AUTHORS_COMPLETED
            });


            dispatch({
                type: actions.types.page.LOADING_STATE_CHANGED,
                payload: 
                { 
                    status: after == null ? LoadingStatus.END : LoadingStatus.DONE,

                }  as actions.types.page.LOADING_STATE_CHANGED
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
                throw(error);
            }
        }
    });
}

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
                            end: after == null
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