import * as Wetland from 'wetland';
import { PostDisplay } from '~/common/models';

export default class UserSettings extends Wetland.Entity
{
    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    public post_display_mode : PostDisplay;

    static setMapping(mapping : Wetland.Mapping<UserSettings>)
    {
        let options = {
            tableName: 'user_settings',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('post_display_mode',
        {
            type: 'enumeration',
            enumeration: ['compact','normal'],
            nullable: false,
            defaultTo: 'compact',
        });

        mapping.oneToOne('user', { targetEntity: 'User', inversedBy: 'settings' }).joinColumn( 'user', {onDelete: 'cascade'} );;
    }

    static formatModel( us : UserSettings )
    {
        return {
            post_display_mode: us.post_display_mode
        }
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}