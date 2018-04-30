export {default as Author} from './Author';
export {default as AuthorEntry} from './AuthorEntry';
export {default as Post} from './Post';
export {default as Subscription} from './Subscription';
export {default as Subreddit} from './Subreddit';
export {default as SubscriptionSubreddit} from './SubscriptionSubreddit';
export {default as ScrapeJob} from './ScrapeJob';
export {default as Settings} from './Settings';
export {default as ScrapeBot} from './ScrapeBot';

import Post from './Post'

export function getBlankPost() : Post
{
    return {
        liked: null,
        visited: null,
        post_id: null,
        created_utc: null,
        title: null,
        score: null,
        subreddit: null,
        author: null,
        num_comments : null,
        link_flair_text : null,
        selftext : null,
        is_self : null,
        thumbnail : null,
        url : null
    };
}