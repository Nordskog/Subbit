import * as Entity from '~/backend/entity'
import * as RFY from '~/backend/rfy'

import * as models from '~/common/models';



export interface Status
{
    //Settings
    enabled     : boolean;
    interval    : number;
    concurrent_requests : number;

    //Status
    worklist_remaining  : number;
    worklist_total : number;
    worklist_active : number,
    processing        : boolean;
    run_start       : number;
    next_run       : number;
}


type PromisedArrayWithPromisedFunctions =        Array< () => any | Promise<any> > |
                                        Promise< Array< () => any | Promise<any> > >;



export class Bot
{
    ///////////////////
    // State
    //////////////////

    enabled : boolean = false;
    processing : boolean = false;

    activeRequests : number = 0;

    runStartTime : Date = new Date(0);
    nextScheduledRun : Date =  new Date(0);

    workListItemCount = 0;

    workList: (() => any)[] = [];                                       //Array of functions returning any
    user_generateWorklist: () =>  PromisedArrayWithPromisedFunctions;   //Function that returns array of functions
    user_stateChangeCallback: (IntervalBotStatus) => void; 

    nextTimeout = null;

    /////////////////
    // Settings
    ////////////////

    interval_seconds = 5000;
    concurrent_requests = 1;


    constructor( concurrent_requests : number, interval_seconds : number, generateWorklist : () =>  PromisedArrayWithPromisedFunctions, stateChangedCallback : (IntervalBotStatus) => void  ) 
    {
        this.interval_seconds = interval_seconds;
        this.concurrent_requests = concurrent_requests;

        this.user_generateWorklist = generateWorklist;
        this.user_stateChangeCallback = stateChangedCallback;
    }

    async generateWorkList()
    {
        this.workList = await this.user_generateWorklist();
        this.workListItemCount = this.workList.length;
    
        console.log(`added ${this.workList.length} subreddits to queue`);
    }
    
    async processQueue()
    {
        console.log(`Processing queue`);
    

        //If disabled or list empty, do nothing.
        if ( !this.processing || !this.enabled )
        {
            this.updateState();
            return;
        }
    
        //Last job finished, or not jobs to begin with.
        if (this.workList.length <= 0 && this.activeRequests <= 0)
        {
            this.processing = false;
            console.log("Scrape bot finished work");
    
            //Reschedule if still enabled
            if (this.enabled)
            {
                this.scheduleRun();
            }
        }
    
        //Add jobs until concurrenct limit reached or list empty
        while( this.workList.length > 0 && this.activeRequests <  this.concurrent_requests)
        {
            this.activeRequests++;
            this.processItem( this.workList.shift() );
        }
    
        this.updateState();
    }
    
    async setConcurrentRequests( concurrentRequests : number)
    {
        this.concurrent_requests = concurrentRequests;
    
        this.updateState();
    }
    
    async setBotEnabled( enable : boolean)
    {
        if (enable)
        {
            this.startBot();
        }
        else
        {
            this. stopBot();
        }
    
        this.updateState();
    }
    
    async setInterval( interval : number)
    {
        console.log("Setting interval to",interval);

        this.interval_seconds = interval;
    
        console.log("Interval now ",this.interval_seconds );
    
        if (this.enabled)
        this.scheduleRun();
    
        this.updateState();
    }
    
    async startBot()
    {
        console.log("Starting interval bot");
    
        this.enabled = true;
        this.scheduleRun();
    
    }
    
    async stopBot()
    {
        console.log("Stopping interval bot");
    
        //Can't do anything if already processing, but stop if scheduled.
        this.enabled = false;

        if (this.nextTimeout != null)
        {
            clearTimeout(this.nextTimeout);
            this.nextTimeout = null;
        }
    
        this.updateState();
    }
    
    removeSchedule()
    {
        if (this.nextTimeout != null)
        {
            console.log("interval bot removing existing scheduled job");
            clearTimeout(this.nextTimeout);
            this.nextTimeout = null;
        }
    }
    
    async scheduleRun()
    {
    
        this.removeSchedule();
    
        let interval = this.interval_seconds;
    
        console.log("Scheduling interval job for",interval," seconds from now");
        this.nextScheduledRun = new Date( Date.now() + (interval * 1000) );
        this.nextTimeout = setTimeout( () => this.run(), interval * 1000 );
    
        this.updateState();
    }
    
    async run()
    {
        if (!this.enabled)
        {
            console.log("Attempted to run intervalBot scrape even though bot is disabled");
            return;
        }
    
        if (this.processing)
        {
            console.log("Attempted to run intervalBot scrape while already running");
            return;
        }
    
        console.log("Running bot");
    
        this.runStartTime = new Date();
        this.processing = true;
        await this.generateWorkList();
        this.processQueue();
    }
    
    async runNow()
    {
        this.removeSchedule();
        this.run();
    
    }
    
    updateState()
    {
        if ( this.user_stateChangeCallback != null)
        {
            this.user_stateChangeCallback( this.getState() );
        }
    }
    
    requestStateUpdate()
    {
        this.updateState();
    }
    
    getState()
    {
        let state : Status;
    
        state = 
        {
            enabled: this.enabled,
            interval: this.interval_seconds,
            concurrent_requests : this.concurrent_requests,
    
            processing : this.processing,
            run_start : this.runStartTime.getTime() / 1000,
            next_run : this.nextScheduledRun.getTime() / 1000,
    
            worklist_active: this.activeRequests,
            worklist_total: this.workListItemCount,
            worklist_remaining: this.workList.length
        };
    
        return state;
    }
    
    async processItem( item : () => Promise<any> | any )
    {
        console.log(`Bot scraping ${item.name}`);
    
        try
        {
            await item();
        }
        catch ( err)
        {
            console.log("IntervalBot failed processing item: ",err);
        }
    
        this.activeRequests--;
    
        //Let queue know a slot is open
        this.processQueue();
    }
}


