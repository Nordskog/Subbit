import * as Wetland from 'wetland';

import ScrapeJob from './ScrapeJob'
import Author from './Author'
import Subscription from './Subscription'
import Post from './Post'
import * as models from '~/common/models'

export default class Subreddit extends Wetland.Entity
{
    public name : string;
    public name_lower : string;
    public autoscrape : boolean;
    public scrape_job : ScrapeJob;

    public posts : Wetland.ArrayCollection<Post>;
    public authors : Wetland.ArrayCollection<Author>;
    public subscriptions : Wetland.ArrayCollection<Subscription>;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<Subreddit>)
    {
        let options = {
            tableName: 'subreddits',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('name',
            {
                type: 'string',
                nullable: false
            });

        mapping.field('name_lower',
        {
            type: 'string',
            nullable: false,
            defaultTo:'null'
        });

        mapping.field('autoscrape',
        {
            type: 'boolean',
            nullable: false,
            defaultTo: true
        });

        mapping.uniqueConstraint('name');
    
        mapping.oneToMany('posts', { targetEntity: 'Post', mappedBy: 'subreddit' });
        mapping.manyToMany('subscriptions', { targetEntity: 'Subscription', mappedBy: 'subreddits' });
        mapping.oneToMany('authors', { targetEntity: 'SubredditAuthor', mappedBy: 'subreddit' });
        mapping.oneToOne('scrape_job', { targetEntity: 'ScrapeJob', mappedBy: 'subreddit' });
    }

    beforeCreate()
    {
        //Fill name_lower
        this.name_lower = this.name.toLowerCase();
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        updatedValues.updatedAt = new Date();
    }

    

    static formatModel(subreddit : Subreddit) : models.data.Subreddit
    {
        if (subreddit == null)
        {
            return null;
        }

        return {
            id: subreddit.id,
            name : subreddit.name,
            autoscrape : subreddit.autoscrape,
            scrape_job : ScrapeJob.formatModel(subreddit.scrape_job)
        } as models.data.Subreddit
    }
}