import { State } from '~/client/store';

import { AuthorFilter } from '~/common/models';
import * as api from '~/common/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'
import * as clientTools from '~/client/tools'
import * as cache from '~/client/cache'
import * as config from '~/config'

import * as authority from '~/client/authority'

export function changeSubreddit( subreddit : string)
{
    return async function (dispatch, getState)
    {
        dispatch({
            type: actions.types.authors.SUBREDDIT_CHANGED,
            payload: subreddit as actions.types.authors.SUBREDDIT_CHANGED
        });

        dispatch( fetchAuthorsAction
            (0, false) );
    }
}

export function fetchAuthorsAction ( page : number = 0, appendResults: boolean = false)
{
    return async function (dispatch, getState)
    {
        if (!appendResults)
            authority.author.clearAuthority();

        //TODO deal with subscription authors

        let state: State = getState();

        let { authors, after }  = await api.reddit.getAuthors( state.authorState.subreddit, state.authorState.filter, state.authorState.after, config.authorDisplayCount );

        let returnedAuthorCount = authors.length;

        console.log("Initial count: ",authors.length);

        //Remove and any existing authors, then update authority with new
        authors = authors.filter( (author : models.data.Author) => { return !authority.author.authorityContains(author) } )

        console.log("Filtered count: ",authors.length);

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

        await actions.directActions.authors.poulateInitialPosts(authorEntries, config.postDisplayCount, dispatch, getState);
        await actions.directActions.authors.populateAuthorSubscriptions(authorEntries, getState);
        
        dispatch({
            type: actions.types.authors.FETCH_AUTHORS_COMPLETED,
            payload: { authors: authorEntries,
                       page: page,
                       end: after == null,
                       append: appendResults,
                       after: after
            }  as actions.types.authors.FETCH_AUTHORS_COMPLETED
        });

        /*
        //Fetch display-count worth of posts
        dispatch( fetchMorePosts
            (authorEntries, config.postDisplayCount) );
            */
    }
}

export function getAllPostInfoAction()
{

    return async function (dispatch, getState)
    {
        let state: State = getState();

        //Never run on server
        if (  !process.env.IS_CLIENT )
         return;

     dispatch( getPostInfoAction
     (state.authorState.authors, config.postDisplayCount) );

    }

}

export function populateAuthority()
{
    return function (dispatch, getState)
    {
        let state: State = getState();
        authority.post.updateAuthorityFromAuthors(state.authorState.authors);
    }
}

export function fetchMorePosts( authors : models.data.AuthorEntry[], count : number )
{
    return async function (dispatch, getState)
    {
        let state: State = getState();
        let proms : Promise<void>[] = [];
        authors.forEach( ( author : models.data.AuthorEntry ) => 
        {
            //TODO deal with subscriptions
            let subreddits : string[] = [];
            if (state.authorState.subreddit != null)
                subreddits = [state.authorState.subreddit];

            let prom = new Promise<void>( (resolve, reject) => 
            {
                api.reddit.getPosts(author.author.name, author.after, null, count, ...subreddits).then( ( {posts, after } ) => 
                {
                    posts.forEach( ( post : models.reddit.Post ) => 
                    {
                        authority.post.updateAuthority(post);
                    } );

                    cache.post.populatePostsFromCache(posts);
                    clientTools.PostInfoQueue.addAuthorToQueue(author.author.name, posts, dispatch);
    
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
        clientTools.PostInfoQueue.processNow(dispatch);
    }
}

export function getPostInfoAction( authors : models.data.AuthorEntry[], perAuthorLimit : number = 5 )
{
    return async function (dispatch, getState)
    {
        let state: State = getState();

        //Never run on server
       // if ( !state.options.isClient )
       //     return;

        if (state.authState.isAuthenticated)
        {
            let redditAuth : models.auth.RedditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth(dispatch,state);

            let chunks : { authors: Set<models.data.Author>, posts: models.reddit.Post[] }[] = [];

            let cacheCounter = 0;
            let newCounter = 0;
            //There is a limit of 25 items per request
            let currentChunk = getAuthorPostChunk();
            chunks.push(currentChunk);
            authors.forEach ( (author : models.data.AuthorEntry) => 
            {
                currentChunk.authors.add(author.author);
                let index = 0;
                for (let post of author.author.posts)
                {
                    if (perAuthorLimit > 0 && index >= perAuthorLimit)
                        break;

                    //New chunk if at 25-post limit
                    if (currentChunk.posts.length >= 25)
                    {
                        currentChunk = getAuthorPostChunk();
                        chunks.push(currentChunk);   
                        //Since there are more posts for this author, add to chunk
                        currentChunk.authors.add(author.author);
                    }

                    //Check cache data
                    let cachedPost : models.reddit.Post = cache.post.getCached(post.id);
                    if (cachedPost)
                    {
                        post.likes = cachedPost.likes;
                        post.visited = cachedPost.visited;
                        cacheCounter++;
                    }
                    else
                    {
                        newCounter++;

                        //Add to cache immediately so we won't attempt to fetch it in other threads
                        let cachePost : models.reddit.Post = <models.reddit.Post>{};
                        cache.post.putCached(post.id, cachePost);

                        currentChunk.posts.push(post);
                    }

                    index++;
                }
            });

            console.log("Got ",cacheCounter," cached results. updating ",newCounter," posts");

            for (let chunk of chunks)
            {
                //If we got all our results from the cache
                //Any cached results should be reflected in ui already
                if (chunk.posts.length < 1)
                {
                    continue;
                }
                

                let postIds = chunk.posts.map( post => 
                {
                        return post.id;
                });

                let postDetails : { likes, visited }[] = await api.reddit.getPostInfo(redditAuth, postIds);
                if (postDetails.length == postIds.length)
                {
                    chunk.posts.forEach( (post, index) => 
                    {
                        let postDetail = postDetails[index];

                        //Post authority may have changed.
                        post = authority.post.getPost(post);
                        
                        post.likes = postDetail.likes;

                        //Update cache
                        let cachePost : models.reddit.Post = <models.reddit.Post>{};
                        cachePost.likes = post.likes;
                        cachePost.visited = post.visited;
                        cache.post.putCached(post.id, cachePost);
                    });
                }
                else
                {
                    console.log("postdetails array length mismatch: ", postIds.length, " vs ", postDetails.length);
                }
                             
                //because list may be re-populated during fetch
                let authorNameSet = new Set<string>();
                chunk.authors.forEach(author => 
                    {
                        authorNameSet.add(author.name);
                    })

                dispatch({
                    type: actions.types.authors.POST_DETAILS_UPDATED,
                    payload: authorNameSet as actions.types.authors.POST_DETAILS_UPDATED
                });
            }

        }
    }
}

function getAuthorPostChunk()
{
    return {authors: new Set<models.data.Author>(), posts: [] };
}

