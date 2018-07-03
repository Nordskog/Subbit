

import {StatsTimeRange, StatsCategoryType} from './types';
import { StatsHistory } from '~/common/models/stats';
import { Exception } from '~/common/exceptions';
import StatsCategory from './StatsCategory'
import * as entityActions from '~/backend/entityActions';
import * as helpers from '~/backend/stats/helpers';

//////////////////////////////////
// Lists all our stats trackers
/////////////////////////////////

const trackers : Map<StatsCategoryType,StatsCategory> = new Map<StatsCategoryType,StatsCategory>();

//Timeranges we have trackers on
const trackedTimeRanges : Set<StatsTimeRange> = new Set<StatsTimeRange>();

//////////////////////////////////
// Convenience functions
//////////////////////////////////

export async function addTracker( category : StatsCategoryType, ...timeRanges : StatsTimeRange[] )
{
    if (timeRanges.length < 1)
        return;

    if (trackedTimeRanges.size < 1)
    {   
        //Start loop that will clear entries older than limit for their interval
        startClearLoop();
    }

    //We keep track of timeranges we are tracking and clear old entries from db on a loop
    for ( let timeRange of  timeRanges )
    {
        trackedTimeRanges.add(timeRange);
    }
    let categoryInstance : StatsCategory = await StatsCategory.construct(category, ...timeRanges);
    trackers.set(category, categoryInstance);
}

export function getTracker( category : StatsCategoryType)
{
    return trackers.get(category);
}

export function add( type : StatsCategoryType, value? : number)
{
    getTracker(type).add(value);
}

export function getHistory( category : StatsCategoryType, timeRange : StatsTimeRange)
{
    let catInstance : StatsCategory = getTracker( category );
    if (catInstance == null)
    {
        throw new Exception(`Invalid stats category: ${category}`);
    }

    let history : StatsHistory = catInstance.getHistory(timeRange);
    history.category = category;

    return history
}

function startClearLoop()
{
    ////////////////////////////////////////
    // Once a minute we clear values that are too old from the db
    ////////////////////////////////////////

    let loopInterval : number = 1000 * 60;  //One minute.
    setInterval( async () => 
    {
        let prunedCount : number = 0;

        for ( let interval of trackedTimeRanges)
        {
            let limit = helpers.getAgeLimit( new Date(), interval );
            prunedCount += await entityActions.stats.pruneOldEntries( interval, limit);
        }

    }, loopInterval);
}