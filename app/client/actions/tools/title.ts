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

    let title = config.client.siteName + " for Reddit";

    if (state.siteState.mode === models.SiteMode.IMPORT)
    {
        title += " - Import";
    }
    if (state.siteState.mode === models.SiteMode.ABOUT)
    {
        title += " - About";
    }
    if (state.siteState.mode === models.SiteMode.PRIVACY)
    {
        title += " - Privacy";
    }
    if (state.siteState.mode === models.SiteMode.STATS)
    {
        title += " - Stats";
    }
    else if (state.authorState.author != null)
    {
        if (state.authorState.subreddit != null)
        {
            title += " - " + state.authorState.author + " in r/" + state.authorState.subreddit;
        }
        else
        {
            title += " - " + state.authorState.author;
        }
    }
    else if (state.authorState.subreddit != null)
    {
        title += " - " + state.authorState.subreddit;
    }
    
    document.title = title;
    
}
