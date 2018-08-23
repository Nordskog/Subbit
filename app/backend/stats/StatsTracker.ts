
import * as models from '~/common/models';

import { StatsTimeRange, StatsDataType } from './types';
import { getAgeLimit, getTimeRangeEnd } from './helpers';
import * as Log from '~/common/log';

// A single value
class StatsEntry
{
    public value : number = 0;
    public end : Date;
    public count? : number = 1 ; // For average. Calculated when entry is finalized (new data is outside range)
    public finalized : boolean = false;

    constructor( end : Date,  value? : number, count? : number )
    {
        this.end = end;
        this.value = value;
        if (this.value == null)
        {
            this.value = 0;
            this.count = 0;
        }
        else
        {
            this.count = 1;
        }
    }
     
    public add( value : number, count? : number)
    {
        this.value += value;
        if (count == null)
        {
            this.count++;
        }
        else
        {
            this.count += count;
        }


    }

    public set( value : number)
    {
        // For cumulative
        this.value = value;
    }

    public finalize( type : StatsDataType)
    {
        this.finalized = true;

        switch(type)
        {
            case StatsDataType.AVERAGE:
            {
                if ( this.count > 0)
                    this.value = this.value / this.count;
                break;
            }

            default:
            {
                // Nothing really.
            }
        }
    }
}

// Values for a single time range
class StatsTimeline
{
    public timeRange : StatsTimeRange;
    public type : StatsDataType;

    public parent : StatsTimeline;

    public entries : StatsEntry[] = [];
    public latestEntry : StatsEntry;

    private finalizedCallback : (StatsTimeline, StatsEntry) => void;

    constructor( timeRange : StatsTimeRange, type : StatsDataType, parent : StatsTimeline, finalizedCallback : (StatsTimeline, StatsEntry) => void )
    {
        this.timeRange = timeRange;
        this.parent = parent;
        this.type = type;
        this.finalizedCallback = finalizedCallback;
    }

    // Caller is responsible for ensuring that value is not null.
    // In the case of cumulative the value should be the actual total,
    // not the difference from previous add.
    public add( value : number, count : number, newDate : Date = new Date() )
    {
        if (this.latestEntry == null || this.latestEntry.end < newDate )
        {
            this.closeCurrentEntry(newDate);

            // Time surpassed end of last previous entry, creat enew.
            this.addNewEntry(newDate, value, count);

            this.prune();
        }
        else
        {
            // Time within end of entry, add data.
            this.addToCurrentEntry(value, 1);
        }
    }

    // Add to current entry without checking date
    public addToCurrentEntry(value : number, count : number)
    {
        if (this.type === StatsDataType.CUMULATIVE)
            this.latestEntry.set(value);
        else
            this.latestEntry.add(value, count);
    }

    public getCurrentValue()
    {
        if (this.latestEntry != null)
            return this.latestEntry.value;
        return 0;
    }

    public addNewEntry( date : Date, value : number, count : number = 1)
    {   
        let newEntry = new StatsEntry(getTimeRangeEnd(date, this.timeRange), value, count);
        this.entries.push(newEntry);
        this.latestEntry = newEntry;
    }
    
    // Let higher timeranges know of new data
    private notifyParent(value : number, count : number, newDate? : Date )
    {
        if (this.parent != null)
        {
            if (newDate == null)
            {
                // If date isn't included self is in same entry as before,
                // which means the parent will be too.
                this.parent.addToCurrentEntry(value, count);
            }
            else
            {
                this.parent.add(value, count, newDate);
            }
        }
    }

    protected prune()
    {
        let ageLimit = getAgeLimit(new Date(), this.timeRange);
        
        let firstValidIndex : number = 0;
        for ( let entry of this.entries)
        {
            if (entry.end > ageLimit)
            {
                break;
            }

            firstValidIndex++;
        }

        if (firstValidIndex > 0)
        {
            this.entries = this.entries.slice(firstValidIndex);
        }
    }

    private closeCurrentEntry( newDate : Date = new Date())
    {
        if (this.latestEntry != null)
        {
            // When we have loaded history, the lastest entry
            // will be an item that is already finalized and stored.
            // Do not emit any signals for it.
            if (!this.latestEntry.finalized)
            {
                this.latestEntry.finalize( this.type );
                // Perform same check in higher time units
                this.notifyParent(this.latestEntry.value, this.latestEntry.count, newDate);
        
                this.finalizedCallback(this, this.latestEntry);
            }
        }
    }

    // Check if we have passed end time of latest entry and should finalize it.
    public check( date? : Date, value? : number )
    {
        if (date == null)
            date = new Date();

        if ( this.latestEntry.end < date )
        {
            this.closeCurrentEntry();

            // Check may be called without a value.
            // If end passed we add a null value,
            // or copy existing value of cumulative.
            if ( value == null)
                value = 0; 
            if (this.type === StatsDataType.CUMULATIVE)
                value = this.getCurrentValue();

            this.addNewEntry(date, value); 
            if ( this.parent != null )
                this.parent.check(date);

            this.prune();
        }
    }
}

export type StatsEntryFinalizedCallback = ( value : number, end : Date, timeRnage : StatsTimeRange, tracker : StatsTracker) => void;

// Overlord
export class StatsTracker
{
    public type : StatsDataType;
    private timelines : StatsTimeline[] = [];
    public lowestUnitTimeLine : StatsTimeline;
    private callback : StatsEntryFinalizedCallback;
    private minExpectedValue : number = 10; // Mainly for display purposes on the client side


    constructor( type : StatsDataType, minExpectedValue : number, ...timeRanges : StatsTimeRange[])
    {
        this.type = type;
        this.minExpectedValue = minExpectedValue;

        // Enums are their time duration in ms. Sort descending.
        timeRanges.sort( (a, b) => b - a );
        let prevTimeline = null;

        for( let timeRange of timeRanges)
        {
            let timeLine = new StatsTimeline( timeRange, type, prevTimeline, (timeline, entry) => this.handleEntryFinalized(timeline,entry) );

            this.timelines.push( timeLine );
            prevTimeline = timeLine;
        }

        this.lowestUnitTimeLine = this.timelines[ this.timelines.length - 1 ];


        if ( type === StatsDataType.ONGOING || type === StatsDataType.AVERAGE )
        {
            // Call add on self to kick things off, with an explicit value of 0
            // Do not do this for cumulative
            this.add(0);
        }
        
        // Only makes sense for ongoing
        if ( type === StatsDataType.ONGOING )
        {
            this.entryEndCheckLoop();
        }

    }

    // Checks if entries have surpassed their end time and should be finalized,
    // incase we don't receive any new data.
    // Only call once, will repeat itself.
    private entryEndCheckLoop()
    {
        

        let nowTime = new Date();
        let newCheck = getTimeRangeEnd( nowTime, this.lowestUnitTimeLine.timeRange );
        let diff = newCheck.getTime() - nowTime.getTime();
        diff += 500;

        setTimeout(() => 
        {
            this.lowestUnitTimeLine.check();
            this.entryEndCheckLoop();
        }, diff);
    }

    // May be called with null for convenience.
    // Default is 1 or previous value for cumulative
    public add( value? : number)
    {   
        if (value == null)
        {
            if (this.type === StatsDataType.CUMULATIVE)
            {
                value = this.lowestUnitTimeLine.getCurrentValue();
            }
            else
            {
                value = 1;
            }
        }

        this.lowestUnitTimeLine.add(value, 1);
    }

    private handleEntryFinalized( timeline : StatsTimeline, entry : StatsEntry )
    {
        if (this.callback != null)
            this.callback(entry.value, entry.end, timeline.timeRange, this);
    }

    public setStatsEntryFinalizedCallback( callback : StatsEntryFinalizedCallback )
    {
        this.callback = callback;
    }

    public getTimeline( timeRange : StatsTimeRange)
    {
        return this.timelines.find( (tm) => tm.timeRange === timeRange );
    }

    public populateHistory( timeRange : StatsTimeRange, data : { value : number, end : Date }[]  )
    {
        let timeline : StatsTimeline = this.getTimeline(timeRange);
        if (timeline == null)
        {
            Log.W("Attempted to restore history of timeline that doesn't exist");
            return;
        }

        // Loaded items are marked as finalized so that even if there is not an existing latestItem
        // it will not be re-saved
        timeline.entries = data.map( ( entry ) => 
        {
            let newEntry = new StatsEntry( entry.end, entry.value);
            newEntry.finalized = true;
            return newEntry;
        });

        // Lowest unit has an entry added in the constructor,
        // but the rest do not.
        if (timeline.latestEntry != null)
        {
            timeline.entries.push(timeline.latestEntry );
        }
        else if (timeline.entries.length > 0)
        {
            timeline.latestEntry = timeline.entries[ timeline.entries.length - 1 ];
        }

        
    }

    public getHistory( timeRange : StatsTimeRange ) : models.stats.StatsHistory
    {
        let entries : StatsEntry[]  = [];
        for ( let timeline of this.timelines)
        {
            if (timeline.timeRange === timeRange)
            {
                entries = timeline.entries;
                break;
            }
        }

        let historyEntries = entries.map( (entry) => 
            {
                return {
                    value: entry.value,
                    end: entry.end.getTime() / 1000
                };
            });

        // Should usually skip the last one, as it is still adding data
        historyEntries.pop();

        return {
            type: this.type,
            timeRange: timeRange,
            limit: ( Date.now() / 1000  ) - ( getAgeLimit( new Date(), timeRange).getTime() / 1000 ),
            data: historyEntries,
            minExpectedValue: this.minExpectedValue
        };
    }


}
