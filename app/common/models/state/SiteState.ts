
import * as models from '~/common/models'

export default interface SiteState
{
    subreddits : models.data.Subreddit[];
    mode : models.state.SiteMode;

}

