import * as Wetland from 'wetland';

import Subscription from './Subscription'
import Auth from './Auth'
import UserSettings from './UserSettings';

export default class User extends Wetland.Entity
{
    public username : string;
    public last_visit : Date;
    
    public auth : Auth;
    public subscriptions : Wetland.ArrayCollection<Subscription>;
    public settings : UserSettings;


    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<User>)
    {
        let options = {
            tableName: 'users',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('username',
            {
                type: 'string',
                nullable: false
            });

        mapping.field('last_visit',
        {
            type: 'timestamp',
            nullable: false,
            defaultTo: 'now()',
        });

        mapping.oneToMany('subscriptions', { targetEntity: 'Subscription', mappedBy: 'user' });
        mapping.oneToOne('auth', { targetEntity: 'Auth', mappedBy: 'user' });
        mapping.oneToOne('settings', { targetEntity: 'UserSettings', mappedBy: 'user' });

        mapping.uniqueConstraint('username');
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}