// tslint:disable:variable-name

import * as Wetland from 'wetland';
import { PostDisplay } from '~/common/models';

export default class UserSettings extends Wetland.Entity
{
    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    public post_display_mode : PostDisplay;

    protected static setMapping(mapping : Wetland.Mapping<UserSettings>)
    {
        let options = {
            tableName: 'user_settings',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.oneToOne('user', { targetEntity: 'User', inversedBy: 'settings' }).joinColumn( 'user', {onDelete: 'cascade'} );
    }

    public static formatModel( us : UserSettings )
    {
        return {
            // Nothing!
        };
    }

    protected beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}
