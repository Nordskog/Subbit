
import * as Knex from 'knex';
import * as RFY from '~/backend/rfy';
import { StatsTimeRange } from '~/backend/stats';

// Returns number of entries pruned
export async function pruneOldEntries( interval : StatsTimeRange, limit : Date ) : Promise<number>
{
    // So apparently knex doesn't support joins in delete statements, which means neither does Wetland.
    // When working directly with knex you can work around this with a subquery.
    let query = RFY.rawQuery().del().from('stats_entries').where( 'end', '<', limit ).whereIn( 'interval_id', function( this : Knex) 
    {
        return this.select("id").from("stats_intervals").where("interval",interval);
    } );

    return (await query) as number;
}
