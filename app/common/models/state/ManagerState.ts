import * as models from '~/common/models'

export default interface ManagerState
{
    //With populated jobs
    subreddits : models.data.Subreddit[];
    scrapeBot: models.data.ScrapeBot;
    settings: models.data.Settings;
}