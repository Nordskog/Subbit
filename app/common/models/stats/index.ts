import { StatsCategoryType, StatsDataType, StatsTimeRange } from '~/backend/stats/types';
export {StatsCategoryType, StatsDataType, StatsTimeRange } from '~/backend/stats/types';

// Single data point
export interface StatsUpdate
{
    category : StatsCategoryType;
    type : StatsDataType;
    timeRange: StatsTimeRange;
    data: StatsDataEntry;

}

// Bunch of data points
export interface StatsHistory
{
    category? : StatsCategoryType;
    type : StatsDataType;
    timeRange: StatsTimeRange;
    limit: number;  // Will discard entries older than this unix time
    data: StatsDataEntry[];
    minExpectedValue: number;
}

// Client equilvanet of StatsEntry
// Date is instead unix time val
export interface StatsDataEntry
{
    value : number;
    end : number;
}
