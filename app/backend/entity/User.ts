// tslint:disable:variable-name

import * as Wetland from 'wetland';
import Subscription from './Subscription';
import Auth from './Auth';
import UserSettings from './UserSettings';

export default class User extends Wetland.Entity
{
    public username : string;
    public username_lower : string;
    public last_visit : Date;
    
    public generation : string;     // token generation
    public auth : Auth;             // Reddit uath
    public additional_auth : Auth;
    public subscriptions : Wetland.ArrayCollection<Subscription>;
    public settings : UserSettings;

    public admin_access : boolean;
    public stats_access : boolean;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    protected static setMapping(mapping : Wetland.Mapping<User>)
    {
        let options = {
            tableName: 'users',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('generation',
            {
                type: 'string',
                nullable: false
            });


        // Unused, but I might use it for something eventually.
        mapping.field('admin_access',
            {
                type: 'boolean',
                nullable: false,
                defaultTo: false
            });

        mapping.field('stats_access',
            {
                type: 'boolean',
                nullable: false,
                defaultTo: false
            });

        mapping.field('username',
            {
                type: 'string',
                nullable: false
            });

        mapping.field('username_lower',
        {
            type: 'string',
            nullable: false
        });

        mapping.field('last_visit',
        {
            type: 'timestamp',
            nullable: false,
            defaultTo: mapping.now()
        });

        // Username will be grabbed from reddit, so case should be constant
        mapping.uniqueConstraint('username');
        mapping.uniqueConstraint('username_lower'); // But I'm paranoid

        mapping.oneToMany('subscriptions', { targetEntity: 'Subscription', mappedBy: 'user' });
        mapping.oneToOne('auth', { targetEntity: 'Auth', mappedBy: 'user' });
        mapping.oneToOne('additional_auth', { targetEntity: 'Auth', mappedBy: 'user_additional' });
        mapping.oneToOne('settings', { targetEntity: 'UserSettings', mappedBy: 'user' });
    }

    protected beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }

    protected beforeCreate()
    {
        // Fill name_lower
        this.username_lower = this.username.toLowerCase();
    }
}
