import { StatsTimeRange, StatsDataType, StatsCategoryType } from './types';
import * as os from 'os';

function floorToNearestMultiple( val : number, multiple : number)
{
    val -= val % multiple;
    return val;
}

function addAndFloorToNearestMultiple( source : number, valAndMultiple : number)
{
    source += valAndMultiple;
    return floorToNearestMultiple(source, valAndMultiple);
}

// Data older than this should be discarded. Corresponds to roughly 360 entries
export function getAgeLimit( date : Date = new Date(), timeRange : StatsTimeRange)
{
    switch(timeRange)
    {
        case StatsTimeRange.DAY:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 365 );  // 1 year
        case StatsTimeRange.HALF_DAY:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 180 );  // half year
        case StatsTimeRange.QUARTER_DAY:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 90 );   // 90 days
        case StatsTimeRange.HOUR:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 7 );    // 1 week
        case StatsTimeRange.HALF_HOUR:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 5 );    // 5 days
        case StatsTimeRange.QUARTER_HOUR:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 3 );    // 3 days
        case StatsTimeRange.TEN_MINUTE:
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 * 2 );    // 2 days
        case StatsTimeRange.FIVE_MINUTE:    
            return new Date( date.getTime() - 1000 * 60 * 60 * 24 );        // 24 hours  
        case StatsTimeRange.MINUTE:
            return new Date( date.getTime() - 1000 * 60 * 60 * 6  );        // 6 hours
        case StatsTimeRange.HALF_MINUTE:
            return new Date( date.getTime() - 1000 * 60 * 60 * 3  );        // 3 hours
        case StatsTimeRange.QUARTER_MINUTE:
            return new Date( date.getTime() - 1000 * 60 * 60 );             // 1 hour
        case StatsTimeRange.TEN_SECOND:
            return new Date( date.getTime() - 1000 * 60 * 60 );             // 1 hour
        case StatsTimeRange.FIVE_SECOND:
            return new Date( date.getTime() - 1000 * 60 * 30);              // 30min
        case StatsTimeRange.SECOND:
            return new Date( date.getTime() - 1000 * 60 * 5 );              // 5min
    }
}

// What's that, a day is not always 24 hours?
// I'll consider that a display problem.
export function getTimeRangeEnd( date : Date, timeRange : StatsTimeRange )
{
    return new Date( addAndFloorToNearestMultiple( date.getTime(), timeRange ) );
}

export function getDataTypeForCategory(category: StatsCategoryType) {
    switch (category) {
        case StatsCategoryType.USERS:
        case StatsCategoryType.AUTHORS:
        case StatsCategoryType.SUBSCRIPTIONS:
            return StatsDataType.CUMULATIVE;
        case StatsCategoryType.MEMORY_USAGE:
        case StatsCategoryType.CPU_USAGE:
            return StatsDataType.AVERAGE;
        default:
            return StatsDataType.ONGOING;
    }
}

// Used when displaying
export function getMinExpectedValueForCategory( category : StatsCategoryType ) : number
{
    switch( category )
    {
        case StatsCategoryType.MEMORY_USAGE:  
            return os.totalmem() / 1024 / 1024;

        case StatsCategoryType.CPU_USAGE:
            return os.cpus().length;    // This makes sense right?
        default:
            return 10;
    }
}
