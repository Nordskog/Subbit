import * as models from '~/common/models'

const postInfoCache : Map<string,models.reddit.Post> = new Map<string,models.reddit.Post>();

export function getCached( post_id : string)
{
    return postInfoCache.get(post_id);
}

export function putCached(post_id : string, post : models.reddit.Post)
{
    postInfoCache.set(post_id, post);
}

export function populatePostsFromCache( posts : models.reddit.Post[])
{
    posts.forEach( (post) =>
    {
        let cached = getCached(post.id);
        if (cached)
        {   
            post.likes = cached.likes;
            post.visited = cached.visited;
        }
    });
}
