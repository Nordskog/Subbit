import * as Wetland from 'wetland';

import Subreddit from './Subreddit'
import Subscription from './Subscription'

export default class Author extends Wetland.Entity
{
    public name : string;
    public name_lower : string;

    public last_post_date : Date;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    public subscriptions : Wetland.ArrayCollection<Subscription>;

    static setMapping(mapping : Wetland.Mapping<Author>)
    {

        let options = {
            tableName: 'authors',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('last_post_date',
        {
            type: 'timestamp',
            nullable: false,
            defaultTo: mapping.now()
        });

        mapping.field('name',
            {
                type: 'string',
                nullable: false
            });
        mapping.uniqueConstraint('name');

        mapping.field('name_lower',
        {
            type: 'string',
            nullable: false,
            defaultTo:'null'
        });

        mapping.oneToMany('subscriptions', { targetEntity: 'Subscription', mappedBy: 'author' });
    }

    beforeCreate()
    {
        //Fill name_lower
        this.name_lower = this.name.toLowerCase();
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}