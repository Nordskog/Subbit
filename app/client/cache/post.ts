import * as models from '~/common/models'

const postInfoCache : Map<string,models.data.Post> = new Map<string,models.data.Post>();

export function getCached( post_id : string)
{
    return postInfoCache.get(post_id);
}

export function putCached(post_id : string, post : models.data.Post)
{
    postInfoCache.set(post_id, post);
}

export function populatePostsFromCache( posts : models.data.Post[])
{
    posts.forEach( (post) =>
    {
        let cached = getCached(post.post_id);
        if (cached)
        {   
            post.liked = cached.liked;
            post.visited = cached.visited;
        }
    });
}
