import * as statsModels from '~/common/models/stats';

export type StatsUpdateCallback = ( stats : statsModels.StatsUpdate ) => void;
export type StatsHistoryCallback = ( stats : statsModels.StatsHistory ) => void;

let statsUpdateCallback : StatsUpdateCallback = null;
let statsHistoryCallback : StatsHistoryCallback = null;

export function setStatsCallbacks( updateCallback : StatsUpdateCallback, historyCallback : StatsHistoryCallback )
{
    statsUpdateCallback = updateCallback;
    statsHistoryCallback = historyCallback;
}

export function dispatchStatsUpdate( stats : statsModels.StatsUpdate )
{

    if ( statsUpdateCallback != null)
    {
        statsUpdateCallback(stats);
    }
}

export function dispatchStatsHistory(stats : statsModels.StatsHistory)
{
    if ( statsHistoryCallback != null)
    {
        statsHistoryCallback(stats);
    }
}

export function active()
{
    if ( statsUpdateCallback == null &&  statsHistoryCallback == null)
    {
        return false;
    }

    return true;
}
