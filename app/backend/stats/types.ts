export enum StatsCategoryType
{
    // Accumulating. These will be updated in loop.
    USERS = "USERS",
    AUTHORS = "AUTHORS",
    SUBSCRIPTIONS = "SUBSCRIPTIONS",

    // Realtime,
    PAGE_LOADS = "PAGE_LOADS",
    USER_PAGE_LOADS = "USER_PAGE_LOADS",
    SUCCESSFUL_LOGINS = "SUCCESSFUL_LOGINS",
    FAILED_LOGINS = "FAILED_LOGINS",
    ERRORS = "ERRORS",

    // Also realtime, but updated in loops
    CPU_USAGE = "CPU_USAGE",
    MEMORY_USAGE = "MEMORY_USAGE"
}

export enum StatsDataType
{
    ONGOING,    // Total of added values
    AVERAGE,    // Average of added values
    CUMULATIVE  // Value as it was provided
}

export enum StatsTimeRange
{
    DAY             = 1000 * 60 * 60 * 24,
    HALF_DAY        = 1000 * 60 * 60 * 12,
    QUARTER_DAY     = 1000 * 60 * 60 * 6,
    HOUR            = 1000 * 60 * 60,
    HALF_HOUR       = 1000 * 60 * 30,
    QUARTER_HOUR    = 1000 * 60 * 15,
    TEN_MINUTE      = 1000 * 60 * 10,
    FIVE_MINUTE     = 1000 * 60 * 5,
    MINUTE          = 1000 * 60,
    HALF_MINUTE     = 1000 * 30,
    QUARTER_MINUTE  = 1000 * 15,
    TEN_SECOND      = 1000 * 10,
    FIVE_SECOND     = 1000 * 5,
    SECOND          = 1000,
}
