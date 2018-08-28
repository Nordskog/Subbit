import * as models from '~/common/models';
import * as urls from '~/common/urls';
import * as api from '~/common/api';
import * as apiTools from './apiTools';

import { Thing, AboutSubreddit } from '~/common/models/reddit';
import { exceptions } from '~/common';

import * as Log from '~/common/log';

interface NamesResponse
{
    names: string[];
}

export async function searchSubreddits(name: string, auth? : models.auth.RedditAuth ) : Promise< string[] >
{
    let url = ( apiTools.authValid( auth ) ? urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL) + "/api/search_reddit_names.json";

    let result : NamesResponse = <NamesResponse> await api.reddit.getRequest(
        url,
        {
            query: name,
            include_over_18: true
        },
        auth);
  
    return result.names;
}

// Get the name of a subreddit, specifically its casing.
// If auth is provide we will use that, but prefer to hit CDNs, so probably won't be used.
// Will return input value if problems are encountered.
export async function getNameIfExists( name: string, auth? : models.auth.RedditAuth  )
{
    let url = ( apiTools.authValid( auth ) ? urls.REDDIT_OAUTH_API_URL : urls.REDDIT_URL) + "/r/" + name + "/about.json";

    let returnValue = name;

    // Reddit is, unfortuantely, terribly inconsistent with their return codes.
    // Accessing a subreddit you are banned from ( e.g. r/reddit ) you will get a 404 with reason "banned".
    // gold_only subreddits when you do not have gold will net you a 403.
    // A subreddit that does not exist will forward you to search.

    // 404/403 should be treated as "exists but we don't get to query the name"
    // if 200 check if returned value is a listing, if so it doesn't exist.
    // otherwise treat 200 as Thing<AboutSubreddit> and get the name.

    try
    {
        let result : Thing<AboutSubreddit> = <Thing< AboutSubreddit> > await api.reddit.getRequest(
            url,
            {

            },
            auth);

        // Reddit breaks promises, if subreddit does not exist result will be a listing.
        if (result.kind === "Listing")
        {
            // Subreddit does not exist
            returnValue = null;
        }
        else
        {
            // Exists and we have access to the name
            returnValue = result.data.display_name;
        }
    }
    catch ( err )
    {
        if (err instanceof exceptions.NetworkException)
        {
            if ( err.code === 403)
            {
                // Subreddit exists but is not public.
                // trust original name.
            }
            else if ( err.code === 404)
            {
                // Code lies.
                // Subreddit exists but we are banned from it.
                // Trust original name.
            }
        }
        else
        {
            Log.E(`Problem fetching subreddit name for: ${name}`);
            Log.E(err);
        }
    }  

    return returnValue;
}
