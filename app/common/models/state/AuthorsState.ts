import AuthorEntry from '~/common/models/data/AuthorEntry'
import * as models from '~/common/models'

export default interface AuthorsState
{
    authors: AuthorEntry[];
    filter: models.AuthorFilter
    subreddit: string;
    author: string;
    after : string;
}