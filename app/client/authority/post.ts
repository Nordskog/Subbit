import * as models from '~/common/models'

const postAuthority : Map<string,models.reddit.Post> = new Map<string,models.reddit.Post>();

export function updateAuthority(post : models.reddit.Post)
{
    postAuthority.set(post.id, post);
}

export function updateAuthorityFromAuthor(author : models.data.Author)
{
    author.posts.forEach ( (post : models.reddit.Post) =>
     {
        updateAuthority(post);
    } )

}

export function updateAuthorityFromAuthors(authors : models.data.AuthorEntry[])
{
    authors.forEach ( (author : models.data.AuthorEntry) =>
    {
        updateAuthorityFromAuthor(author.author);
   } )
}

export function getPostById(post_id : string)
{
    return postAuthority.get(post_id);
}

//Sets auth if null
export function getPost(post : models.reddit.Post)
{
    let authPost = postAuthority.get(post.id);
    if (authPost == null)
    {
        updateAuthority(post);
        return post;
    }

    return authPost;
}