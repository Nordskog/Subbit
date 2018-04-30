import * as models from '~/common/models'

const postAuthority : Map<string,models.data.Post> = new Map<string,models.data.Post>();

export function updateAuthority(post : models.data.Post)
{
    postAuthority.set(post.post_id, post);
}

export function updateAuthorityFromAuthor(author : models.data.Author)
{
    author.posts.forEach ( (post : models.data.Post) =>
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
export function getPost(post : models.data.Post)
{
    let authPost = postAuthority.get(post.post_id);
    if (authPost == null)
    {
        updateAuthority(post);
        return post;
    }

    return authPost;
}