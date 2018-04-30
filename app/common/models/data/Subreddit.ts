import ScrapeJob from './ScrapeJob'

export default interface Subreddit
{
    id?: number;
    name?: string;
    autoscrape?: boolean;
    scrape_job? : ScrapeJob

}