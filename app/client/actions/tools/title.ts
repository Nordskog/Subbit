import { GetState } from "~/client/actions/tools/types";
import { State } from "~/client/store";
import config from 'root/config';
import * as models from '~/common/models';
import { getFilterDisplayString } from "~/common/tools/string";

export function updateTitle( getState : GetState)
{
    // Test if non-standard route, of which there currently are none
    // Apart from specific sections, we are only going to bother with subreddits and authors.
    // Otherwise keep title generic, with filter if present.

    // "for Reddit" added to make more recognizable in search results
    let state : State = getState();

    if (state.siteState.mode === models.SiteMode.STATS)
    {
        document.title = config.client.siteName + " for Reddit - Stats";
    }
    else if (state.authorState.author != null)
    {
        if (state.authorState.subreddit != null)
        {
            document.title = config.client.siteName + " for Reddit - " + state.authorState.author + " in r/" + state.authorState.subreddit;
        }
        else
        {
            document.title = config.client.siteName + " for Reddit - " + state.authorState.author;
        }
    }
    else if (state.authorState.subreddit != null)
    {
        document.title = config.client.siteName + " for Reddit - " + state.authorState.subreddit;
    }
    /*
    else if (state.authorState.filter != null)
    {
        document.title = config.client.siteName+" for Reddit - "+getFilterDisplayString(state.authorState.filter);
    }
    */
    else
    {
        document.title = config.client.siteName + " for Reddit";
    }
    
}
