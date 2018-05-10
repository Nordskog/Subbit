import * as models from '~/common/models'
import * as urls from '~/common/urls'

export function getNewestPostsByAuthorsInSubredditUrl(subreddit : string, authors : string[])
{
    //Target format:
    // https://www.reddit.com/r/HFY/search.json?q=author:Athishasnotgonewell+OR+author:Athishasnotgonewell11&restrict_sr=on&include_over_18=on&sort=new&t=all

    let url = `${urls.REDDIT_URL}/r/${subreddit}/search.json?q=`;
    if (authors.length < 1)
        return url; //Reddit will just return an empty listing

    let query = '';
    let separator = '';
    for (let author of authors)
    {
        if (author == null)
            continue;
            query = query + separator + 'author:' + author;
        separator = '+OR+';
    }

    url = url+query;
    url = url + '&restrict_sr=on&include_over_18=on&sort=new&t=all&limit=100'

    return url;
}

export function getFilterUrl(subreddit : string, filter : models.AuthorFilter) : string
{
    let url = urls.REDDIT_URL;
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

    return url;
}