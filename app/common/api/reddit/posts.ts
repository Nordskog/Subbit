
import * as models from '~/common/models'
import { reddit } from '~/common/models'

import * as apiTools from './apiTools'
import * as urls from '~/common/urls'
import * as api from '~/common/api';


export const POST_FULLNAME_PREFIX = "t3_";

export async function getAuthors(subreddit? : string, filter? : models.AuthorFilter, after? : string, count? : number, auth? : models.auth.RedditAuth, ) : Promise< { authors : models.data.Author[], after : string } >
{
    let result : reddit.ListingResponse = <reddit.ListingResponse> await api.reddit.getRequest(
        apiTools.getFilterUrl(subreddit, filter, auth != null), 
        {
            after: after,
            limit : count
        },
        auth);

    if (filter == models.AuthorFilter.HOT)
    {
        //Stickied posts are always at the top of the list in hot. Remove them for now.
        //TODO think about stickies
        result.data.children = result.data.children.filter( ( post : reddit.Thing<reddit.Post> ) => { return !post.data.stickied } );
    }

    let authors : models.data.Author[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
    {
        return {
            id: -1, //Not provided here
            name: post.data.author,
            last_post_date: post.data.created_utc,   //As far as this listing is concerned
            posts : [],
            post_count : 0,  //hmmm
            subscriptions: []
        }
    });

    //Remove duplicates, prioritizing lower-index authors
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
    let {baseUrl, params} = apiTools.getPostsUrl(author, after, count, auth != null, ...subreddits);

    let result : reddit.ListingResponse = <reddit.ListingResponse> await api.reddit.getRequest(
        baseUrl,
        params,
        auth);
  
    let posts : models.reddit.Post[] = result.data.children.map( ( post : reddit.Thing<reddit.Post> ) => 
    {
        return post.data
    });

    //Filter stickied posts for now. TODO: think about stickies
    posts = posts.filter( ( post : models.reddit.Post ) => { return !post.stickied } );

    return { posts: posts,  after: result.data.after };

}


