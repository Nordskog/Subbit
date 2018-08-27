export interface Token
{
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    refresh_token?: string;
}

export interface Thing<T>
{
    kind: string;
    data: T;
}

export interface Listing<T>
{
    modhash : string;
    dist: number;
    after: string;
    before : string;
    children : Thing<T>[];
}

// Commented out bits are removed on fetch so we don't waste storage on them
export interface Post
{
    author : string;
    // author_flair_css_class : string,
    author_flair_text: string;
    // contest_mode : string,
    created_utc	: number;
    // domain : string,
    // full_link : string,
    id : string;
    is_self	: boolean;
    // link_flair_css_class : string,
    link_flair_text : string;
    // locked : boolean,
    num_comments : number;
    over_18	: boolean;
    permalink : string;
    // retrieved_on : number,
    score : number;
    // selftext : string,
    spoiler	: boolean;
    stickied : boolean;
    subreddit : string;
    // subreddit_id : string,
    thumbnail : string;
    title : string;
    url : string;
    likes : boolean;
    // visited : boolean,
    // thumbnail_height: number;
}

export interface AboutSubreddit
{
    display_name : string;
}

export type ListingResponse = Thing< Listing< Post > >;
{
    
}
