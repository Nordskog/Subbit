import { AuthorFilter, PostTimeRange } from "~/common/models";

export function getFilterDisplayString( filter : AuthorFilter)
{
    switch( filter )
    {
        case AuthorFilter.SUBSCRIPTIONS:
            return "subscriptions";
        case AuthorFilter.BEST:
            return "best";
        case AuthorFilter.HOT:
            return "hot";
        case AuthorFilter.NEW:
            return "new";
        case AuthorFilter.TOP:
            return "top";
        case AuthorFilter.RISING:
            return "rising";
        case AuthorFilter.CONTROVERSIAL:
            return "controversial";
    }
}

export function getTimeRangeDisplayString( range : PostTimeRange )
{
    switch( range )
    {
        case PostTimeRange.HOUR:
            return "hour";
        case PostTimeRange.DAY:
            return "day";
        case PostTimeRange.WEEK:
            return "week";
        case PostTimeRange.MONTH:
            return "month";
        case PostTimeRange.YEAR:
            return "year";
        case PostTimeRange.ALL:
            return "all";
    }
}

export function sanitizeAlphaNumericDashUnderscore( str : string)
{
    //Remove any illegal characters
    return str.replace(/[^\w\d\-_]/gi, '');
}

export function confirmAlphaNumericDashUnderscore( str : string)
{
    //Returns true if the input string only contains alphanumerical characters and underscore and dash.
    //These should be the only characters valid on reddit.
    return /^(?:\w|\d|[-_])+$/.test(str)
}