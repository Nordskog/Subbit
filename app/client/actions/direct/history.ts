import { History } from 'history';
import { AuthorEntry } from '~/common/models/data';
import { GetState } from '~/client/actions/tools/types';
import { State } from '~/client/store';

let history : History;
export function setHistory( historyIn : History )
{
    history = historyIn;
}

export async function saveAuthors( getState : GetState )
{
    let state : State = getState();
    let authors : AuthorEntry[] = state.authorState.authors;
    let after = state.authorState.after;

    let newState = { ...history.location.state, authors: authors.slice(), after: after };
    history.replace( { ... history.location, state: newState} );
}

export function loadAuthors()
{
    if (history != null)
    {
        // Do not restore from history if action is REPLACE.
        // In our setup this occurs when we access the same path as current, or when we reload the tab.
        // The former should act as a refresh, the latter is handled by session.
        if (history.action === "REPLACE")
            return;

        if (history.location.state != null)
        {
            return history.location.state.authors;
        }
    }

    return null;
}

export function loadAfter()
{
    if (history != null)
    {
        if (history.location.state != null)
        {
            return history.location.state.after;
        }
    }

    return null;
}
