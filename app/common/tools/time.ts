
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;
const SECONDS_IN_YEAR = SECONDS_IN_MONTH * 12;

function formatTime(singularUnit: string, count: number)
{
    //Includes space at end
    if (count === 0)
        return "";
    else if (count === 1)
        return count + " " +singularUnit+" ";
    else
        return count + " " + singularUnit + "s ";
}

export function dateToUnix(date : Date)
{
    if (date == null)
        return null;
    return date.getTime() / 1000;
}

export function getTimeSinceDisplayString(secondsSince: number) : string
{
    let now: number = Math.floor(Date.now() / 1000);
    return secondsToTimeSinceString(now - secondsSince);
}

export function getSimpleTimeSinceDisplayString(secondsSince: number) : string
{
    let now: number = Math.floor(Date.now() / 1000);
    return secondsToSimpleTimeSinceString(now - secondsSince);
}

function distributeSeconds( seconds : number)
{
    let years, months, weeks, days, hours, minutes: number = 0;

    years = Math.floor(seconds / SECONDS_IN_YEAR);
    seconds -= years * SECONDS_IN_YEAR;

    months = Math.floor(seconds / SECONDS_IN_MONTH);
    seconds -= months * SECONDS_IN_MONTH;

    weeks = Math.floor(seconds / SECONDS_IN_WEEK);
    seconds -= weeks * SECONDS_IN_WEEK;

    days = Math.floor(seconds / SECONDS_IN_DAY);
    seconds -= days * SECONDS_IN_DAY;

    hours = Math.floor(seconds / SECONDS_IN_HOUR);
    seconds -= hours * SECONDS_IN_HOUR;

    minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    seconds -= minutes * SECONDS_IN_MINUTE;

    return { years, months, weeks, days, hours, minutes }
}

function secondsToTimeSinceString(seconds: number) : string
{
    let { years, months, weeks, days, hours, minutes } = distributeSeconds(seconds);

    if (years > 0)
        return formatTime("year", years) + "ago";
    if (months > 0)
        return formatTime("month", months) + "ago";
    if (weeks > 0)
        return formatTime("week", weeks) + "ago";
    if (days > 0)
        return formatTime("day", days) + "ago";
    if (hours > 0)
        return formatTime("hour", hours) + "ago";
    if (minutes > 0)
        return formatTime("minute", minutes) + "ago";
    if (seconds > 0)
        return formatTime("second", seconds) + "ago";
}

function secondsToSimpleTimeSinceString(seconds: number) : string
{
    let { years, months, weeks, days, hours, minutes } = distributeSeconds(seconds);

    if (years > 0)
        return formatTime("year", years);
    if (months > 0)
        return formatTime("month", months);
    if (weeks > 0)
        return formatTime("week", weeks);
    if (days > 0)
        return formatTime("day", days);
    if (hours > 0)
        return formatTime("hour", hours);
    if (minutes > 0)
        return minutes+ " min";
    if (seconds > 0)
        return seconds+ " sec";
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }