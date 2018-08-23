// tslint:disable:variable-name

import * as Wetland from 'wetland';
import Author from './Author';
import * as models from '~/common/models';

export default class Subreddit extends Wetland.Entity
{
    public name : string;
    public name_lower : string;
    public autoscrape : boolean;

    public authors : Wetland.ArrayCollection<Author>;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    protected static setMapping(mapping : Wetland.Mapping<Subreddit>)
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
        });

        mapping.uniqueConstraint('name_lower');
    
        mapping.manyToMany('subscriptions', { targetEntity: 'Subscription', mappedBy: 'subreddits' });
    }

    protected beforeCreate()
    {
        // Fill name_lower
        this.name_lower = this.name.toLowerCase();
    }

    protected beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        updatedValues.updatedAt = new Date();
    }

    

    public static formatModel(subreddit : Subreddit) : models.data.Subreddit
    {
        if (subreddit == null)
        {
            return null;
        }

        return {
            id: subreddit.id,
            name : subreddit.name
        } as models.data.Subreddit;
    }
}
