import { AuthorEntry } from '~/common/models/data/';
import * as models from '~/common/models';

export default interface AuthorsState
{
    authors: AuthorEntry[];
    filter: models.AuthorFilter;
    subreddit: string;
    author: string;
    time: models.PostTimeRange;
    after : string;
}
