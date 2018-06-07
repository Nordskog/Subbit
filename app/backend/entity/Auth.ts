import * as Wetland from 'wetland';
import User from './User'

export default class Auth extends Wetland.Entity
{
    public access_token : string;
    public expiry: Date;
    public scope : string;
    public refresh_token : string;
    public token_type : string;
    public auth_type : string;
    public user : User;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<Auth>)
    {

        let options = {
            tableName: 'auths',
        };
        mapping.entity(options);

        mapping.forProperty('id').primary().increments();

        mapping.field('auth_type',
            {
                type: 'string',
                nullable: false
            });

        mapping.field('access_token',
            {
                type: 'string',
                nullable: false
            });

        mapping.field('expiry',
            {
                type: 'timestamp',
                nullable: false
            });

        mapping.field('token_type',
            {
                type: 'string',
                nullable: false
            });

        mapping.field('refresh_token',
            {
                type: 'string',
                nullable: true
            });

        mapping.field('scope',
            {
                type: 'string',
                nullable: false
            });

        mapping.oneToOne('user', { targetEntity: 'User', inversedBy: 'auth' }).joinColumn( 'user', {onDelete: 'cascade'} );
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}