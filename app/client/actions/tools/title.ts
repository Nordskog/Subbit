import { GetState } from "~/client/actions/tools/types";
import { State } from "~/client/store";
import config from 'root/config';
import { getFilterDisplayString } from "~/common/tools/string";

export function updateTitle( getState : GetState)
{
    //Test if non-standard route, of which there currently are none
    //Apart from specific sections, we are only going to bother with subreddits and authors.
    //Otherwise keep title generic, with filter if present.
    let state : State = getState();

    if (state.authorState.author != null)
    {
        if (state.authorState.subreddit != null)
        {
            document.title = config.client.siteName+" - "+state.authorState.author+" in "+state.authorState.subreddit;
        }
        else
        {
            document.title = config.client.siteName+" - "+state.authorState.author;
        }
    }
    else if (state.authorState.subreddit != null)
    {
        document.title = config.client.siteName+" - "+state.authorState.subreddit;
    }
    else if (state.authorState.filter != null)
    {
        document.title = config.client.siteName+" - "+getFilterDisplayString(state.authorState.filter);
    }
    else
    {
        document.title = config.client.siteName;
    }
    
} 