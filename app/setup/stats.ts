import * as RFY from '~/backend/rfy'
import * as Wetland  from 'wetland';
import * as entityActions from '~/backend/entityActions'
import * as stats from '~/backend/stats'
import { StatsCategoryType, StatsTimeRange } from '~/backend/stats'

import * as os from 'os';

let StatsCategoryTypeEnums : StatsCategoryType[] = [
    
    
    StatsCategoryType.USERS, 
    StatsCategoryType.AUTHORS, 
    StatsCategoryType.SUBSCRIPTIONS,
    StatsCategoryType.PAGE_LOADS, 
    StatsCategoryType.USER_PAGE_LOADS, 
    StatsCategoryType.SUCCESSFUL_LOGINS, 
    StatsCategoryType.FAILED_LOGINS, 
    StatsCategoryType.ERRORS,
    StatsCategoryType.CPU_USAGE, 
    StatsCategoryType.MEMORY_USAGE
]

export async function setup()
{
    /////////////////////////
    // Setup all trackers
    /////////////////////////

    //Make sure to update interval loop below if you change the min unit here
    const timeRanges = [ StatsTimeRange.DAY, StatsTimeRange.HOUR, StatsTimeRange.MINUTE  ];

    for ( let category of StatsCategoryTypeEnums)
    {
        await stats.addTracker(category, ...timeRanges);
    }

    ////////////////////////////////////////
    // Update cumulative values on a loop
    ////////////////////////////////////////

    let interval : number = 1000 * 60;  //One minute.
    setInterval( async () => 
    {
        
        let manager : Wetland.Scope = RFY.wetland.getManager();
    
        stats.add( StatsCategoryType.AUTHORS,       await entityActions.authors        .getCount(manager) )
        stats.add( StatsCategoryType.SUBSCRIPTIONS, await entityActions.subscriptions  .getCount(manager) )
        stats.add( StatsCategoryType.USERS,         await entityActions.user           .getCount(manager) )
        
        let totalMem =   os.totalmem() / 1024 / 1024;
        let freeMem =   os.freemem() / 1024 / 1024;
        let usedMem =  totalMem - freeMem;

        //Currently 1 minute average. Make sure to match to shortest time range.
        //CPU will always be 1 on windows.
        stats.add( StatsCategoryType.CPU_USAGE,  os.loadavg[0] );
        stats.add( StatsCategoryType.MEMORY_USAGE, usedMem );

    }, interval);
}

