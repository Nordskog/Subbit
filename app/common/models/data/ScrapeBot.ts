export default interface ScrapeBot
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