
import * as models from '~/common/models';

import { StatsTimeRange, StatsDataType } from './types';
import { getAgeLimit, getTimeRangeEnd } from './helpers';

//A single value
class StatsEntry
{
    value : number = 0;
    end : Date;
    count? : number = 1 ; //For average. Calculated when entry is finalized (new data is outside range)

    constructor( end : Date,  value? : number, )
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
     
    add( value : number)
    {
        this.value += value;
        this.count++;
    }

    set( value : number)
    {
        //For cumulative
        this.value = value;
    }

    finalize( type : StatsDataType)
    {
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
                //Nothing really.
            }
        }
    }
}

//Values for a single time range
class StatsTimeline
{
    timeRange : StatsTimeRange;
    type : StatsDataType;

    parent : StatsTimeline;

    entries : StatsEntry[] = [];
    latestEntry : StatsEntry;

    finalizedCallback : (StatsTimeline, StatsEntry) => void;

    constructor( timeRange : StatsTimeRange, type : StatsDataType, parent : StatsTimeline, finalizedCallback : (StatsTimeline, StatsEntry) => void )
    {
        this.timeRange = timeRange;
        this.parent = parent;
        this.type = type;
        this.finalizedCallback = finalizedCallback;
    }

    //Caller is responsible for ensuring that value is not null.
    //In the case of cumulative the value should be the actual total,
    //not the difference from previous add.
    add( value : number, newDate : Date = new Date())
    {
        if (this.latestEntry == null || this.latestEntry.end < newDate )
        {
            this.closeCurrentEntry();
            this.prune();

            //Time surpassed end of last previous entry, creat enew.
            this.addNewEntry(newDate, value);

            // Perform same check in higher time units
            this.notifyParent(value, newDate);
        }
        else
        {
            //Time within end of entry, add data.
            this.addToCurrentEntry(value);
        }
    }

    //Add to current entry without checking date
    addToCurrentEntry(value : number)
    {
        if (this.type == StatsDataType.CUMULATIVE)
            this.latestEntry.set(value);
        else
            this.latestEntry.add(value);
        
        this.notifyParent(value);
    }

    getCurrentValue()
    {
        if (this.latestEntry != null)
            return this.latestEntry.value;
        return 0;
    }

    addNewEntry( date : Date, value : number)
    {   
        let newEntry = new StatsEntry(getTimeRangeEnd(date, this.timeRange), value);
        this.entries.push(newEntry);
        this.latestEntry = newEntry;
    }
    
    //Let higher timeranges know of new data
    notifyParent(value : number, newDate? : Date )
    {
        if (this.parent != null)
        {
            if (newDate == null)
            {
                //If date isn't included self is in same entry as before,
                //which means the parent will be too.
                this.parent.addToCurrentEntry(value);
            }
            else
            {
                this.parent.add(value, newDate);
            }
        }
    }

    prune()
    {
        if ( this.latestEntry != null)
        {
            let ageLimit = getAgeLimit(this.latestEntry.end, this.timeRange);
            
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
    }

    closeCurrentEntry()
    {
        if (this.latestEntry != null)
        {
            this.latestEntry.finalize( this.type );

            this.finalizedCallback(this, this.latestEntry);
        }
    }

    //Check if we have passed end time of latest entry and should finalize it.
    check( date? : Date, value? : number )
    {
        if ( this.latestEntry != null )
        {
            this.prune();

            if (date == null)
                date = new Date();

            if ( this.latestEntry.end < date )
            {
                this.closeCurrentEntry();

                //Check may be called without a value.
                //If end passed we add a null value,
                //or copy existing value of cumulative.
                if ( value == null)
                    value = 0; 
                if (this.type == StatsDataType.CUMULATIVE)
                    value = this.getCurrentValue();

                this.addNewEntry(date, value); 
                if ( this.parent != null )
                    this.parent.check(date);
            
            }
        }
        else
        {
            //Gotto have parents check anyway
            if ( this.parent != null )
                this.parent.check(date);
        }
    }
}

export type StatsEntryFinalizedCallback = ( value : number, end : Date, timeRnage : StatsTimeRange, tracker : StatsTracker) => void;

//Overlord
export class StatsTracker
{
    type : StatsDataType;
    timelines : StatsTimeline[] = [];
    lowestUnitTimeLine : StatsTimeline;
    callback : StatsEntryFinalizedCallback;
    minExpectedValue : number = 10; //Mainly for display purposes on the client side


    constructor( type : StatsDataType, minExpectedValue : number, ...timeRanges : StatsTimeRange[])
    {
        this.type = type;
        this.minExpectedValue = minExpectedValue;

        //Enums are their time duration in ms. Sort descending.
        timeRanges.sort( (a, b) => b - a );
        let prevTimeline = null;

        for( let timeRange of timeRanges)
        {
            let timeLine = new StatsTimeline( timeRange, type, prevTimeline, (timeline, entry) => this.handleEntryFinalized(timeline,entry) )
            this.timelines.push( timeLine );
            prevTimeline = timeLine;
        };

        

        this.lowestUnitTimeLine = this.timelines[ this.timelines.length - 1 ]

        //Only makes sense for ongoing
        if ( type == StatsDataType.ONGOING )
            this.entryEndCheckLoop();
    }

    //Checks if entries have surpassed their end time and should be finalized,
    //incase we don't receive any new data.
    //Only call once, will repeat itself.
    entryEndCheckLoop()
    {
        let nowTime = new Date();
        let newCheck = getTimeRangeEnd( nowTime, this.lowestUnitTimeLine.timeRange );
        let diff = newCheck.getTime() - nowTime.getTime();
        setTimeout(() => 
        {
            this.lowestUnitTimeLine.check();
            this.entryEndCheckLoop();
        }, diff);
    }

    //May be called with null for convenience.
    //Default is 1 or previous value for cumulative
    add( value? : number)
    {   
        if (value == null)
        {
            if (this.type == StatsDataType.CUMULATIVE)
            {
                value = this.lowestUnitTimeLine.getCurrentValue();
            }
            else
            {
                value = 1;
            }
        }

        this.lowestUnitTimeLine.add(value);
    }

    handleEntryFinalized( timeline : StatsTimeline, entry : StatsEntry )
    {
        if (this.callback != null)
            this.callback(entry.value, entry.end, timeline.timeRange, this);
    }

    setStatsEntryFinalizedCallback( callback : StatsEntryFinalizedCallback )
    {
        this.callback = callback;
    }

    getTimeline( timeRange : StatsTimeRange)
    {
        return this.timelines.find( tm => tm.timeRange == timeRange );
    }

    populateHistory( timeRange : StatsTimeRange, data : { value : number, end : Date }[]  )
    {
        let timeline : StatsTimeline = this.getTimeline(timeRange);
        if (timeline == null)
        {
            console.log("Attempted to restore history of timeline that doesn't exist");
            return;
        }

        timeline.entries = data.map( ( entry ) => 
        {
            return new StatsEntry( entry.end, entry.value);
        });

        if (timeline.latestEntry != null)
            timeline.entries.push(timeline.latestEntry );
    }

    getHistory( timeRange : StatsTimeRange ) : models.stats.StatsHistory
    {
        let entries : StatsEntry[]  = [];
        for ( let timeline of this.timelines)
        {
            if (timeline.timeRange == timeRange)
            {
                entries = timeline.entries;
                break;
            }
        }

        let historyEntries = entries.map( entry => 
            {
                return {
                    value: entry.value,
                    end: entry.end.getTime() / 1000
                }
            });

        //Should usually skip the last one, as it is still adding data
        historyEntries.pop();

        return {
            type: this.type,
            timeRange: timeRange,
            limit: ( Date.now() / 1000  ) - ( getAgeLimit( new Date(), timeRange).getTime() / 1000 ),
            data: historyEntries,
            minExpectedValue: this.minExpectedValue
        }
    }


}