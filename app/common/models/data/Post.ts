export default interface Post
{
    title: string;
    post_id: string;    //Differs from reddit format "id"
    score: number;
    created_utc: number;
    liked: boolean;
    visited: boolean;
    subreddit: string;
    author: string;

    num_comments : number;
    link_flair_text : string;
    selftext : string; //Usually not populated
    is_self : boolean;
    thumbnail : string;
    url : string;
}