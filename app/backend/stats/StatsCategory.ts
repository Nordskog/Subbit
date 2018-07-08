

import { getDataTypeForCategory, getMinExpectedValueForCategory } from "./helpers";
import {StatsTracker, StatsEntryFinalizedCallback} from './StatsTracker';


import * as socketActions from '~/backend/sockets/actions';
import * as Entities from '~/backend/entity';
import * as Wetland from 'wetland';
import * as RFY from '~/backend/rfy'

import {StatsTimeRange, StatsCategoryType} from './types';

import * as Log from '~/common/log';


/////////////////////////////////////////////////////////////////
// Wrapper from StatsTracker that will handle saving/loading
/////////////////////////////////////////////////////////////////

export default class StatsCategory 
{
    public tracker : StatsTracker;
    public category : StatsCategoryType;
    public timeRanges : StatsTimeRange[];

    private categoryEntityId = null;

    private static StatsIntervalEntityMap : Map<StatsTimeRange, number> = new Map<StatsTimeRange, number>();
    
    public static async construct( category : StatsCategoryType, ...timeRanges : StatsTimeRange[]  )
    {
        //Dodging some race conditions when different categories are all trying to
        //init intervals at the same time
        let instance : StatsCategory = new StatsCategory(category, ...timeRanges);
        
        await instance.init();

        return instance;
    }

    private constructor( category : StatsCategoryType, ...timeRanges : StatsTimeRange[]  )
    {
        this.category = category;
        this.timeRanges = timeRanges;

        this.tracker = new StatsTracker( getDataTypeForCategory(category), getMinExpectedValueForCategory(category), ...timeRanges ); 
        this.tracker.setStatsEntryFinalizedCallback( (value, end, timeRange, tracker) => { this.handleUpdate(value, end,timeRange, tracker) } )
    }

    private async init()
    {

        //Init IDs of category and all the intervals
        await this.initCategoryId();
        await Promise.all( 
                        this.timeRanges.map( (timeRange : StatsTimeRange )  => { return this.initIntervalId(timeRange) } )
                    );
        await this.loadHistory()
    }

    getCategoryId() : number 
    {
        return this.categoryEntityId;
    }

    getIntervalId( interval : StatsTimeRange) : number 
    {
        return StatsCategory.StatsIntervalEntityMap.get(interval);
    }

    async initCategoryId()
    {
        if ( this.categoryEntityId != null)
            return this.categoryEntityId;

        let manager : Wetland.Scope = RFY.wetland.getManager();
        let categoryEntity : Entities.StatsCategory = await manager.getRepository(Entities.StatsCategory).findOne( { category : this.category } );
        if ( categoryEntity == null )
        {
            //Doesn't exist, create.
            categoryEntity = new Entities.StatsCategory();
            categoryEntity.category = this.category;
            manager.persist(categoryEntity);
            await manager.flush();

            //Item is returned with id
        }

        this.categoryEntityId = categoryEntity.id;

        return this.categoryEntityId;
    }

    async initIntervalId( interval : StatsTimeRange)
    {
        let manager : Wetland.Scope = RFY.wetland.getManager();

        //Check map first
        let id = this.getIntervalId(interval);
        if (id == null)
        {
            //Check database.
            let intervalEntity : Entities.StatsInterval = await manager.getRepository(Entities.StatsInterval).findOne( { interval : interval } );
            if (intervalEntity == null)
            {
                //Doesn't exist, create.
                intervalEntity = new Entities.StatsInterval();
                intervalEntity.interval = interval;
                manager.persist(intervalEntity);
                await manager.flush();
            }

            StatsCategory.StatsIntervalEntityMap.set( interval, intervalEntity.id );
            id = intervalEntity.id;
        }

        return id;
    }

    async loadHistory()
    {
        let manager : Wetland.Scope = RFY.wetland.getManager();

        for ( let interval of this.timeRanges)
        {
            let entries : Entities.StatsEntry[] = await manager.getRepository(Entities.StatsEntry).find( 
                                                                                { 
                                                                                    category_id : this.getCategoryId(), 
                                                                                    interval_id: this.getIntervalId(interval)
                                                                                },
                                                                                {
                                                                                        orderBy: {"end": 'asc' }
                                                                                }
                                                                            ) || [];
            if (entries != null && entries.length > 0)
                this.tracker.populateHistory(interval, entries);
        }
    }

    async saveEntry( value : number, end : Date, interval : StatsTimeRange )
    {

        try
        {
            let intervalId = this.getIntervalId(interval);
    
            let manager : Wetland.Scope = RFY.wetland.getManager();
            let entryEntity : Entities.StatsEntry = new Entities.StatsEntry();
            
            entryEntity.value = value;
            entryEntity.end = end;

            entryEntity.interval_id = intervalId;
            entryEntity.category_id = this.getCategoryId();
    
            manager.persist(entryEntity);
            await manager.flush();
        }
        catch ( err )
        {
            Log.E("Problem saving stats entry");
            Log.E(err);
        }
    }

    handleUpdate( value, end, timeRange, tracker)
    {
        this.saveEntry(value, end, timeRange);
        this.notifySocket(value,end, this.category, timeRange, tracker);

        //Skip database if not set up yet
    }

    notifySocket( value : number, end : Date, category: StatsCategoryType, timeRange : StatsTimeRange, tracker : StatsTracker )
{
    socketActions.stats.dispatchStatsUpdate(
    {
        category : category,
        type : tracker.type,
        timeRange: timeRange,
        data: {
            value : value,
            end: end.getTime() / 1000
        }
    })
}

    ////////////////////
    //Passthrough
    ////////////////////

    add( value? : number)
    {
        this.tracker.add(value);
    }

    getHistory( timeRange : StatsTimeRange )
    {
       return this.tracker.getHistory(timeRange);
    }
}