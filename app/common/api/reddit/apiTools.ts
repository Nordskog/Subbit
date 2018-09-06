import * as models from '~/common/models';
import * as urls from '~/common/urls';
import * as config from 'root/config';
import * as log from '~/common/log';

export function getFilterUrl(subreddit : string, filter : models.AuthorFilter, oauth : boolean) : string
{
    let url = `${oauth ?  urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL}`;
    if (subreddit != null)
    {
        url = url + `/r/${subreddit}`;

        switch(filter)
        {
            case models.AuthorFilter.TOP:
            case models.AuthorFilter.NEW:
            {
                // TODO range selection for top
                url = url + `/${filter}`;
                break;
            }

            // Default is nothing, which corresponds to hot
            // BEST is not valid here
            case models.AuthorFilter.HOT:
            default:
            {

            } 
        }
    }
    else
    {
        switch(filter)
        {
            case models.AuthorFilter.TOP:
            case models.AuthorFilter.NEW:
            case models.AuthorFilter.HOT:
            {
                // TODO range selection
                url = url + `/${filter}`;
                break;
            }

            // Default is nothing, which corresponds to best
            case models.AuthorFilter.BEST:
            default:
            {

            } 
        }
    }

    url = `${url}${ oauth ? '' : '/.json' }`;

    return url;
}

export function getPostsUrl(author : string, after : string, limit : number, oauth : boolean,  ...subreddits : string[]) : { baseUrl, params }
{
    let url = oauth ?  urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL;
    let params;
    if (subreddits == null || subreddits.length < 1)
    {

        // Accessing /user/submissions requires history permission, even if accessing the page of another user.
        // Circumvent by using search instead.
        url = url + `/search/${ oauth ? '' : '.json' }`;

        params =
            {
                include_over_18: 'on',
                q: 'author:' + author,
                sort: 'new',
                after: after,
                limit: limit,
                raw_json: 1 // Otherwise you get html-safe characters
            };
        
    }
    else
    {
        url = url + `/r/${subreddits.join('+')}/search${ oauth ? '' : '.json' }`;

        params =
            {
                restrict_sr: 'on',
                include_over_18: 'on',
                q: 'author:' + author,
                sort: 'new',
                after: after,
                limit: limit,
                raw_json: 1     // Otherwise you get html-safe characters
            };
        
    }

    return { baseUrl: url, params: params };
}

export function getPostSearchUrl( searchTerm : string, subreddit : string, oauth : boolean, limit = 10) : { baseUrl, params }
{
    let url = oauth ?  urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL;
    let params;
    {
        url = url + `/r/${subreddit}/search${ oauth ? '' : '.json' }`;

        params =
            {
                restrict_sr: 'on',
                include_over_18: 'on',
                q: `title:"${searchTerm}"`,
                limit: limit,
                raw_json: 1     // Otherwise you get html-safe characters
            };
        
    }

    return { baseUrl: url, params: params };
}

export function authValid( auth : models.auth.RedditAuth )
{
    if (auth == null)
        return false;
    if (auth.expiry <= Date.now() / 1000)
    {
        log.E("Reddit auth present but expired");
        return false;
    }

    return true;
}

// We will be storing posts in session storage,
// so get rid of any data we don't actually use.
export function filterPostContent( post : models.reddit.Post )
{
    return {
        author : post.author,
        author_flair_text: post.author_flair_text,
        created_utc	: post.created_utc,
        id : post.id,
        is_self	: post.is_self,
        link_flair_text : post.link_flair_text,
        num_comments : post.num_comments,
        over_18	: post.over_18,
        permalink : post.permalink,
        score : post.score,
        spoiler	: post.spoiler,
        stickied : post.stickied,
        subreddit : post.subreddit,
        thumbnail : post.thumbnail,
        title : post.title,
        url : post.url,
        likes : post.likes,
    };
}
