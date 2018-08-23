// tslint:disable:variable-name

import * as Wetland from 'wetland';
import Subscription from './Subscription';

export default class Author extends Wetland.Entity
{
    public name : string;
    public name_lower : string;

    public last_post_date : Date;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    public subscriptions : Wetland.ArrayCollection<Subscription>;

    protected static setMapping(mapping : Wetland.Mapping<Author>)
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

        mapping.field('name_lower',
        {
            type: 'string',
            nullable: false,
        });

        mapping.uniqueConstraint('name_lower');

        mapping.oneToMany('subscriptions', { targetEntity: 'Subscription', mappedBy: 'author' });
    }

    protected beforeCreate()
    {
        // Fill name_lower
        this.name_lower = this.name.toLowerCase();
    }

    protected beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}
