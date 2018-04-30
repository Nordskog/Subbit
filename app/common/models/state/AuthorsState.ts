import AuthorEntry from '~/common/models/data/AuthorEntry'

export default interface AuthorsState
{
    authors: AuthorEntry[];
    filter: string;
    subreddit: string;
    author: string;
}