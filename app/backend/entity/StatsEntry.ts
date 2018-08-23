// tslint:disable:variable-name

import * as Wetland from 'wetland';
import StatsCategory from './StatsCategory';
import StatsInterval from './StatsInterval';

export default class StatsEntry extends Wetland.Entity
{
    public value : number;
    public end : Date;

    // For the love of god never populate these during a query
    public category : StatsCategory;
    public interval : StatsInterval;

    public id : number;

    // These values exist so we can establish the below relationships
    // without having to keep track of the actual relation entities.
    // There are more proper ways of doing so, but this is probably the simplest.
    public interval_id : number;
    public category_id : number;


    protected static setMapping(mapping : Wetland.Mapping<StatsEntry>)
    {
        let options = {
            tableName: 'stats_entries',
        };
        mapping.entity(options);

        // We would normally use autofields to include created/update times
        // But there will be a lot of entries and this information serves no purpose
        // mapping.autoFields();
        mapping.forProperty('id').primary().increments();

        mapping.field('end',
        {
            type: 'timestamp',
            nullable: false,
            defaultTo: mapping.now()
        });

        mapping.field('value',
        {
            type: 'float',
            nullable: false,
        });

        mapping.manyToOne('interval', { targetEntity: 'StatsInterval', inversedBy: 'entry' }).joinColumn( 'interval', {onDelete: 'cascade'} );
        mapping.manyToOne('category', { targetEntity: 'StatsCategory', inversedBy: 'entry' }).joinColumn( 'category', {onDelete: 'cascade'} );
     
    }

    protected beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        updatedValues.updatedAt = new Date();
    } 

}
