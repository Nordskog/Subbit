import * as models from '~/common/models'

const authorAuthority : Map<string,models.data.Author> = new Map<string,models.data.Author>();

export function updateAuthority(author : models.data.Author)
{
    authorAuthority.set(author.name, author);
}

export function authorityContains(author : models.data.Author)
{
    return authorAuthority.has(author.name);
}

export function clearAuthority()
{
    authorAuthority.clear();
}