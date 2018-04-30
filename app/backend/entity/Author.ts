import * as Wetland from 'wetland';

import SubredditAuthor from './SubredditAuthor'
import Post from './Post'
import Subscription from './Subscription'

export default class Author extends Wetland.Entity
{
    public name : string;
    public name_lower : string;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    public in_subreddit : Wetland.ArrayCollection<SubredditAuthor>;
    public posts : Wetland.ArrayCollection<Post>;
    public subscriptions : Wetland.ArrayCollection<Subscription>;

    static setMapping(mapping : Wetland.Mapping<Author>)
    {

        let options = {
            tableName: 'authors',
        };
        mapping.entity(options);

        mapping.autoFields();

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

        mapping.oneToMany('in_subreddit', { targetEntity: 'SubredditAuthor', mappedBy: 'author' });
        mapping.oneToMany('posts', { targetEntity: 'Post', mappedBy: 'author' });
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