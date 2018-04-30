import * as Wetland from 'wetland';

export default class Setting extends Wetland.Entity
{
    public autoscrape : boolean;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    public autoscrape_interval_seconds : number;
    public autoscrape_concurrent_requests : number;

    static setMapping(mapping : Wetland.Mapping<Setting>)
    {
        let options = {
            tableName: 'settings',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('autoscrape',
            {
                type: 'boolean',
                nullable: false,
                defaultTo: false
            });

        mapping.field('autoscrape_interval_seconds',
        {
            type: 'integer',
            nullable: false,
            defaultTo: 500
        });

        mapping.field('autoscrape_concurrent_requests',
        {
            type: 'integer',
            nullable: false,
            defaultTo: 2
        });
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}