import * as Wetland from 'wetland';
import Subreddit from './Subreddit';
import * as models from '~/common/models'
import * as events from '~/backend/events'

export default class ScrapeJob extends Wetland.Entity
{
    //Database-backed
    public job_start_time : Date;
    public scrape_from_time : Date;
    public scrape_to_time : Date;
    public last_update_time : Date;
    public processed_count : number;
    public max_pages : number;
    public status : string;
    public subreddit : Subreddit;
    public job_type : string;
    public last_post_time : Date;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<ScrapeJob>)
    {
        let options = {
            tableName: 'scrape_jobs',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('job_start_time',
        {
            type: 'timestamp',
            nullable: true
        });
        mapping.field('scrape_from_time',
        {
            type: 'timestamp',
            nullable: true
        });
        mapping.field('scrape_to_time',
        {
            type: 'timestamp',
            nullable: true
        });
        mapping.field('max_pages',
        {
            type: 'integer',
            nullable: true
        });

        ///////////////////////////
        // Updated during scrape
        ///////////////////////////
        mapping.field('processed_count',
        {
            type: 'integer',
            nullable: false,
            defaultTo: 0

        });
        mapping.field('status',
        {
            type: 'enumeration',
            enumeration: ['pending','working', 'finished', 'cancelled', 'error', 'never run'],
            nullable: false,
            defaultTo: 'never run',

        });

        mapping.field('job_type',
        {
            type: 'enumeration',
            enumeration: ['reddit', 'pushshift'],
            nullable: false,

        });
        mapping.field('last_post_time',
        {
            type: 'timestamp',
            nullable: true
        });

        mapping.oneToOne('subreddit', { targetEntity: 'Subreddit', inversedBy: 'scrapeJob' }, ).joinColumn( 'subreddit', {onDelete: 'cascade'} );
    }

    static formatModel(job : ScrapeJob) : models.data.ScrapeJob
    {
        if (job == null)
        {
            return null;
        }

        return {
            id: job.id,
            job_start_time:  dateToUnix( job.job_start_time ),
            scrape_from_time: dateToUnix( job.scrape_from_time ),
            scrape_to_time:  dateToUnix( job.scrape_to_time ), 
            updatedAt: job.updatedAt.getTime() / 1000,
            processed_count: job.processed_count,
            status: job.status,
            job_type: job.job_type,
            last_post_time :  dateToUnix( job.last_post_time ),
            subreddit: Subreddit.formatModel(job.subreddit)
        } as models.data.ScrapeJob
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        updatedValues.updatedAt = new Date();
    }

    afterUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        events.callJobUpdatedListeners(this);
    }
}

function dateToUnix(date : Date)
{
    if (date == null)
        return null;
    return date.getTime() / 1000;
}