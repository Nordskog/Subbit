import Subreddit from './Subreddit'
import * as models from '~/common/models'

export default interface ScrapeJob
{
    id? : number;
    job_start_time? : number;
    scrape_from_time? : number;
    scrape_to_time? : number;
    updatedAt?: number;
    processed_count?: number;
    status?: string;
    subreddit? : Subreddit;
    job_type?: models.ScrapeType;
    last_post_time? : number;
}