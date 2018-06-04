import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as config from '~/config'

export function getFilterUrl(subreddit : string, filter : models.AuthorFilter, oauth : boolean) : string
{
    let url = `${oauth ?  urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL}`
    if (subreddit != null)
    {
        url = url + `/r/${subreddit}`;

        switch(filter)
        {
            case models.AuthorFilter.TOP:
            case models.AuthorFilter.NEW:
            {
                //TODO range selection for top
                url = url + `/${filter}`;
                break;
            }

            //Default is nothing, which corresponds to hot
            //BEST is not valid here
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
                //TODO range selection
                url = url + `/${filter}`;
                break;
            }

            //Default is nothing, which corresponds to best
            case models.AuthorFilter.BEST:
            default:
            {

            } 
        }
    }

    url = `${url}${ oauth ? '' : '/.json' }`

    return url;
}

export function getPostsUrl(author : string, after : string, limit : number, oauth : boolean,  ...subreddits : string[]) : { baseUrl, params }
{
    let url = oauth ?  urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL;
    let params;
    if (subreddits == null || subreddits.length < 1)
    {
        url = url + `/user/${author}/submitted${ oauth ? '' : '.json' }`

        params =
            {
                sort: 'new',
                after: after,
                limit: limit,
                raw_json: 1 //Otherwise you get html-safe characters
            };
        
    }
    else
    {
        url = url + `/r/${subreddits.join('+')}/search${ oauth ? '' : '.json' }`

        params =
            {
                restrict_sr: 'on',
                include_over_18: 'on',
                q: 'author:'+author,
                sort: 'new',
                after: after,
                limit: limit,
                raw_json: 1     //Otherwise you get html-safe characters
            };
        
    }

    return { baseUrl: url, params: params };
}