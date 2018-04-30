export default interface RedditPost
{
    author : string,
    author_flair_css_class : string,
    author_flair_text: string,
    contest_mode : string,
    created_utc	: number,
    domain : string,
    full_link : string,
    id : string,
    is_self	: boolean,
    link_flair_css_class : string,
    link_flair_text : string,
    locked : boolean,
    num_comments : number,
    over_18	: boolean
    permalink : string,
    retrieved_on : number,
    score : number,
    selftext : string,
    spoiler	: boolean,
    stickied : boolean,
    subreddit : string,
    subreddit_id : string,
    thumbnail : string,
    title : string,
    url : string
}