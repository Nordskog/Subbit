import * as Wetland from 'wetland';

import * as models from '~/common/models'

import StatsEntry from './Statsentry'

export default class StatsInterval extends Wetland.Entity
{
    public interval : number;
    public entries : Wetland.ArrayCollection<StatsEntry>;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<StatsInterval>)
    {
        let options = {
            tableName: 'stats_intervals',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('interval',
        {
            type: 'integer',
            nullable: false,
        });

        mapping.uniqueConstraint('interval');

        mapping.oneToMany('entries', { targetEntity: 'StatsEntry', mappedBy: 'interval' });

    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        updatedValues.updatedAt = new Date();
    } 

}