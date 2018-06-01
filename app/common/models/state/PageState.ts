export default interface ScrollState
{
    nextPageLoading : boolean;
    endReached : boolean;
    currentPage : number;   //For author subscriptions
    loadingCount : number;
    loadingProgress : number;
}
