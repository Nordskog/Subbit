
import * as models from '~/common/models';
import { reddit } from '~/common/models';

import * as apiTools from './apiTools';
import * as urls from '~/common/urls';
import * as api from '~/common/api';


export const POST_FULLNAME_PREFIX = "t3_";

export async function getAuthors( seedWithPost : boolean, subreddit? : string, filter? : models.AuthorFilter, time?: models.PostTimeRange, after? : string, count? : number, auth? : models.auth.RedditAuth, ) : Promise< { authors : models.data.Author[], after : string } >
{
    let result : reddit.ListingResponse = <reddit.ListingResponse> await api.reddit.getRequest(
        apiTools.getFilterUrl(subreddit, filter, apiTools.authValid( auth )), 
        {
            after: after,
            limit : count,
            t: time
        },
        auth);

    if (filter === models.AuthorFilter.HOT)
    {
        // Stickied posts are always at the top of the list in hot. Remove them for now.
        // TODO think about stickies
        result.data.children = result.data.children.filter( ( post : reddit.Thing<reddit.Post> ) =>   !post.data.stickied );
    }

    let authors : models.data.Author[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
    {
        let entry = {
            id: -1, // Not provided here
            name: post.data.author,
            last_post_date: post.data.created_utc,   // As far as this listing is concerned
            posts : [],
            post_count : 0,  // hmmm
            subscriptions: []
        };

        // When a user makes their first post to a subreddit, it will not be present in some of reddit's apis
        // for some time. Seems to only occur when there is only a single post.
        // Workaround is to include it here, and just erase later if we get a proper post list.
        if (seedWithPost)
        {
            entry.posts.push( apiTools.filterPostContent( post.data ) );
        }
        return entry;
    });

    // Remove duplicates, prioritizing lower-index authors
    let authorNameSet = new Set<string>();
    authors = authors.filter( ( author : models.data.Author ) => 
    {
        if (authorNameSet.has( author.name ))
        {
            return false;
        }
        else
        {
            authorNameSet.add(author.name);
            return true;
        }
    } );

    return { authors: authors,  after: result.data.after };
    
}

export async function getPosts(author: string, after : string, auth : models.auth.RedditAuth, count : number,  ...subreddits : string[] ) : Promise< { posts : models.reddit.Post[], after : string } >
{
    let {baseUrl, params} = apiTools.getPostsUrl(author, after, count, apiTools.authValid( auth ), ...subreddits);

    let result : reddit.ListingResponse = <reddit.ListingResponse> await api.reddit.getRequest(
        baseUrl,
        params,
        auth
    );
  
    let posts : models.reddit.Post[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
    {
        return post.data;
    });

    // Filter stickied posts for now. TODO: think about stickies
    posts = posts.filter( ( post : models.reddit.Post ) => !post.stickied );

    // And remove any data we don't want, as we'll be storing this in session storage.
    posts = posts.map( (post) => apiTools.filterPostContent(post));

    return { posts: posts,  after: result.data.after };

}

// Normal reddit search will also search the contents of self text posts, making them useless for searching by post title.
// with title:"something something" you can narrow it down to the title, but it only accepts full words, no partials.
// Go with the latter as it at least produces somewhat useful results.
export async function searchPosts( subreddit: string, searchTerm : string, limit? : number, auth? : models.auth.RedditAuth ) : Promise<models.reddit.Post[]>
{
    let {baseUrl, params} = apiTools.getPostSearchUrl(searchTerm, subreddit, apiTools.authValid( auth ), limit);

    let result : reddit.ListingResponse = <reddit.ListingResponse> await api.reddit.getRequest(
        baseUrl,
        params,
        auth);
  
    let posts : models.reddit.Post[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
    {
        return post.data;
    });

    // Filter stickied posts for now. TODO: think about stickies
    posts = posts.filter( ( post : models.reddit.Post ) => !post.stickied );

    return posts;
}

