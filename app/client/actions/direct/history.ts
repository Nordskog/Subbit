import { History } from 'history';
import { AuthorEntry } from '~/common/models/data';

let history : History;
export function setHistory( historyIn : History )
{
    history = historyIn;
}

export function saveAuthors(  authors : AuthorEntry[], after : string)
{
    let newState = { ...history.location.state, authors: authors.slice(), after: after };
    history.replace( { ... history.location, state: newState} );
}

export function loadAuthors()
{
    if (history != null)
    {
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