import * as models from '~/common/models'
import * as api from '~/common/api'
import { State } from '~/client/store';
import * as authority from '~/client/authority'
import * as actions from '~/client/actions'
import config from 'root/config'
import { Dispatch, GetState } from '~/client/actions/tools/types';
import { NetworkException } from '~/common/exceptions';
import * as Log from '~/common/log'
import { Author, AuthorEntry } from '~/common/models/data';
import { authRouter } from '~/backend/resource';


export async function getAuthors( dispatch : Dispatch, getState : GetState )
{
    let state: State = getState();

    let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, state);

    let authors : models.data.Author[];
    let after : string;

    if (state.authorState.author != null)
    {
        //Single author
        authors = [{
            id : -1,
            name: state.authorState.author, //Need to correct lookup name maybe
            last_post_date: 0,
            post_count : 0,
            posts: [],
            subscriptions: []
        }]
    }    
    else if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
    {
        let subscriptions = state.userState.subscriptions;
        //Filter by subreddit if present
        //Slow? Yes. Could put a hashmap in the state, but even with a few hundred subscriptions
        //this is going to be essentially instant.
        if (state.authorState.subreddit != null)
        {
            let filteredSubs = [];
            let lowerCaseSubname = state.authorState.subreddit.toLowerCase();

            subscriptions.forEach( (sub : models.data.Subscription) => 
            {
                for (let i = 0; i < sub.subreddits.length; i++)
                {
                    if (sub.subreddits[i].name.toLowerCase() == lowerCaseSubname )
                    {
                        filteredSubs.push(sub);
                        break;
                    }
                }
            });

            subscriptions = filteredSubs;
        }

        //Subscriptions
        authors = subscriptions.map( ( sub : models.data.Subscription ) => 
        {
            return {
                    id : -1,
                    name: sub.author,
                    last_post_date: 0,
                    post_count : 0,
                    posts: [],
                    subscriptions: []
                }
        });
        after = null;


    }
    else
    {
        //Subreddit or frontpage
        let res = await api.reddit.posts.getAuthors( true, state.authorState.subreddit, state.authorState.filter, state.authorState.time, state.authorState.after, config.client.authorDisplayCount, redditAuth );
         
        authors = res.authors;
        after = res.after;
    }


    //Remove and any existing authors, then update authority with new
    authors = authors.filter( (author : models.data.Author) => { return !authority.author.authorityContains(author) } )
    authors.forEach( ( author : models.data.Author ) => { authority.author.updateAuthority(author) } );

    let authorEntries : models.data.AuthorEntry[] = authors.map( ( author : models.data.Author ) => 
    {
        return {
            author: author,
            subscription: null,
            after: null,
            end: true
        }
    } ); 

    ensureSubredditCasingMatch(dispatch, authorEntries, state.authorState.subreddit);

    await actions.directActions.authors.populateAuthorSubscriptions(authorEntries, getState);   //Important to do this before getting posts
    await actions.directActions.authors.poulateInitialPosts(authorEntries, config.client.postDisplayCount, dispatch, getState);

    if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
    {
        authorEntries.sort( (a : models.data.AuthorEntry, b: models.data.AuthorEntry) => 
        {
            let aCreated = a.author.posts.length > 0 ? a.author.posts[0].created_utc : 0;
            let bCreated = b.author.posts.length > 0 ? b.author.posts[0].created_utc : 0;

            if (aCreated > bCreated)
                return -1;
            if (aCreated < bCreated)
                return 1;
            return 0;
        });
    }

    return { authorEntries : authorEntries, after : after  };
}

//Checks if subreddit name in state matches that returned by reddit listing, and corrects it if wrong.
//Usually the result of a user submitting search before waiting for result, or visiting from uncased url
export function ensureSubredditCasingMatch( dispatch : Dispatch, authors : AuthorEntry[], subredditName : string )
{
    if (subredditName == null || authors == null || authors.length < 1)
        return;

    //Author listing comes from a normal page listing, and will always have a single post populated.
    for (let author of authors)
    {
        if (author.author.posts.length > 0)
        {
            let postSubreddit = author.author.posts[0].subreddit;

            console.log("Considering name change from",subredditName,"to",postSubreddit)

            if (author.author.posts[0].subreddit != subredditName)
            {
                //They don' match!
                //But incase of weirdness, make sure they do match if both lower case
                
                if ( postSubreddit.toLowerCase() == subredditName.toLowerCase() )
                {
                    console.log("Dispatching name change from",subredditName,"to",postSubreddit);

                    //They match, dispatch a correction to use casing from post.
                    dispatch({
                        type: actions.types.authors.SUBREDDIT_NAME_CHANGED,
                        payload: postSubreddit as actions.types.authors.SUBREDDIT_NAME_CHANGED
                    });
                }
            }

            break;
        }
    }

    

}

export function populateAuthorSubscriptions( authors : models.data.AuthorEntry[], getState : GetState )
{
    let subscriptions : models.data.Subscription[] = (<State> getState()).userState.subscriptions;

    let subMap : Map<string, models.data.Subscription> = new Map( subscriptions.map( 
        ( sub: models.data.Subscription ): [string, models.data.Subscription] => [sub.author, sub] ) );

    authors.forEach( ( author : models.data.AuthorEntry ) => 
    {
        author.subscription =  subMap.get( author.author.name );
    });
}

export function updateLoadingProgress (count : number, progress : number, dispatch)
{
    dispatch
    ({ 
            type: actions.types.page.LOADING_PROGRESS,
            payload: 
            { 
                loadingProgress: progress, 
                loadingCount: count 
            } as actions.types.page.LOADING_PROGRESS
    });
}

export async function poulateInitialPosts(authors : models.data.AuthorEntry[], count : number, dispatch : Dispatch, getState : GetState)
{
        

        let state: State = getState();

        let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, state);

        let authorCount : number = authors.length;
        let authorCompletedCount : number = 0;

        let proms : Promise<void>[] = [];
        authors.forEach( ( author : models.data.AuthorEntry ) => 
        {
            let subreddits : string[] = [];
            if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
            {
                //Well that shouldn't happen
                if (author.subscription == null)
                {
                    Log.W("Attempted to populate posts for subscribed author with no subscription: ", author.author.name);
                    return;
                }
                   

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

            let prom = new Promise<void>( async (resolve, reject) => 
            {
                //Doesn't bubble up on its own
                try
                {
                    let { posts, after } = await api.reddit.posts.getPosts(author.author.name, author.after, redditAuth, count, ...subreddits);
                    
                    author.after = after;;
                    author.end = after == null;

                    //Author will usually be seeded by a single post we got via the normal listing.
                    //If existing post is newer than any we got via search,
                    //include it at the beginning. New posts are usually available
                    //via search instantly, but they are sometimes delayed by over a day.
                    if (posts.length > 0)
                    {
                        if (author.author.posts.length > 0)
                        {
                            if (author.author.posts[0].created_utc > posts[0].created_utc)
                            {
                                // There have been rare cases of reddit going completely mental
                                //and including a post with the same id but different created_utc times.
                                //Since it is rare that this block will be run, we might as well handle that case too.
                                let postExists : boolean = false;
                                for ( let post of posts )
                                {
                                    if (post.id == author.author.posts[0].id )
                                    {
                                        postExists = true;
                                        break;
                                    }
                                }

                                if (!postExists)
                                    posts.unshift(author.author.posts[0]);
                            }
                        }

                        author.author.posts = posts;
                    }

                    if (author.author.posts.length > 0)
                    {
                        author.author.last_post_date = author.author.posts[0].created_utc;
                    }
                     

                    authorCompletedCount++;
                    updateLoadingProgress(authorCount, authorCompletedCount, dispatch);

                    resolve();
                }
                catch ( err )
                {
                    //User may be subscribed to subreddits that they do not have access to.
                    //Reddit will return 404 if banned, and 403 if otherwuse not authorized.
                    //If we have gotten the author list it means we have access to the subreddit
                    //we are in, or are viewing subscriptions, and we don't want this to fail the rest of them.
                    //Especially since this will prevent them from unsubscribing to them.
                    //Maybe we should never reject and just display a separate error from here?
                    if ( err instanceof NetworkException && (err.code == 404 || err.code == 403) )
                    {
                        resolve();
                    } 
                    else
                    {
                        reject (err);
                    }
                    
                }
            });

            proms.push(prom);

        });

        //Process any remaining
        await Promise.all(proms);


}