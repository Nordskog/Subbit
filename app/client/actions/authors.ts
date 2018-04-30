import { State } from '~/client/store';

import * as viewFilters from '~/common/viewFilters';
import * as api from '~/client/api'
import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as tools from '~/common/tools'
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

        let state: State = getState();

        let filter: string = state.authorState.filter;
        let token: string = tools.store.getAccessToken(state);

        let subreddit : string =  state.authorState.subreddit;
        let author : string = state.authorState.author;

        let authors : models.data.AuthorEntry[]  = await api.authors.fetchAuthors(filter, subreddit, author, page, token);

        //Update post authority
        authors.forEach(author => 
        {
            authority.post.updateAuthorityFromAuthor(author.author);
        });

        if ( process.env.IS_CLIENT )
        { 
            for (let author of authors)
                cache.post.populatePostsFromCache(author.author.posts);   
            dispatch( getPostInfoAction
            (authors, config.postDisplayCount) );
            
        }

        dispatch({
            type: actions.types.authors.FETCH_AUTHORS_COMPLETED,
            payload: { authors: authors,
                       page: page,
                       end: authors.length < config.authorDisplayCount,
                       append: appendResults
            }  as actions.types.authors.FETCH_AUTHORS_COMPLETED
        });
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


export function getMorePosts( author : models.data.AuthorEntry, count : number, offset : number)
{

    return async function (dispatch, getState)
    {
        let state: State = getState();

        let posts : models.data.Post[];
        if (state.authorState.subreddit != null)
        {
            posts = await api.authors.getAuthorPosts(author.author.id,count,offset,state.authorState.subreddit);
        }
        else if (state.authorState.filter == viewFilters.authorFilter.SUBSCRIPTIONS)
        {
            posts = await api.authors.getAuthorPosts(author.author.id,count,offset,null, state.authState.user.access_token);
        }
        else
        {
            posts = await api.authors.getAuthorPosts(author.author.id,count,offset,null, null);
        }

        dispatch({
            type: actions.types.authors.POSTS_ADDED,
            payload: { authorId: author.author.id,
                       posts: posts 
            } as actions.types.authors.POSTS_ADDED
        });

        //Dispatch using a dummy author
        dispatch( getPostInfoAction(
            [{ ...author,
                author:{
                    ...author.author,
                    posts:posts
                }
            }], config.postDisplayCount) );
    }
}

export function getPostInfoAction( authors : models.data.AuthorEntry[], perAuthorLimit : number = 5 )
{
    return async function (dispatch, getState)
    {

        let state: State = getState();

        //Never run on server
        if ( !state.options.isClient )
        return;

        if (state.authState.isAuthenticated)
        {
            let redditAuth : models.auth.RedditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth(dispatch,state);

            let chunks : { authors: Set<models.data.Author>, posts: models.data.Post[] }[] = [];

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
                    let cachedPost : models.data.Post = cache.post.getCached(post.post_id);
                    if (cachedPost)
                    {
                        post.liked = cachedPost.liked;
                        post.visited = cachedPost.visited;
                        cacheCounter++;
                    }
                    else
                    {
                        newCounter++;

                        //Add to cache immediately so we won't attempt to fetch it in other threads
                        let cachePost : models.data.Post = models.data.getBlankPost();
                        cache.post.putCached(post.post_id, cachePost);

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
                        return post.post_id;
                });

                let postDetails : { likes, visited }[] = await api.reddit.getPostInfo(redditAuth, postIds);
                if (postDetails.length == postIds.length)
                {
                    chunk.posts.forEach( (post, index) => 
                    {
                        let postDetail = postDetails[index];

                        //Post authority may have changed.
                        post = authority.post.getPost(post);
                        
                        post.liked = postDetail.likes;

                        //Update cache
                        let cachePost : models.data.Post = models.data.getBlankPost();
                        cachePost.liked = post.liked;
                        cachePost.visited = post.visited;
                        cache.post.putCached(post.post_id, cachePost);
                    });
                }
                else
                {
                    console.log("postdetails array length mismatch: ", postIds.length, " vs ", postDetails.length);
                }
                             
                //because list may be re-populated during fetch
                let authorIdSet = new Set<number>();
                chunk.authors.forEach(author => 
                    {
                        authorIdSet.add(author.id);
                    })

                dispatch({
                    type: actions.types.authors.POST_DETAILS_UPDATED,
                    payload: authorIdSet as actions.types.authors.POST_DETAILS_UPDATED
                });
            }

        }
    }
}

function getAuthorPostChunk()
{
    return {authors: new Set<models.data.Author>(), posts: [] };
}

