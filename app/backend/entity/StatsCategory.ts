import * as Wetland from 'wetland';

import * as models from '~/common/models'
import StatsEntry from './Statsentry'

export default class StatsCategory extends Wetland.Entity
{
    public category : models.stats.StatsCategoryType;
    public entries : Wetland.ArrayCollection<StatsEntry>;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<StatsCategory>)
    {
        let options = {
            tableName: 'stats_categories',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('category',
        {
            type: 'string',
            nullable: false,
        });

        mapping.uniqueConstraint('category');

        mapping.oneToMany('entries', { targetEntity: 'StatsEntry', mappedBy: 'category' });

    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        updatedValues.updatedAt = new Date();
    } 

}