import * as models from '~/common/models';
import { arch } from 'os';
import { GetState } from '~/client/actions/tools/types';
import { State } from '~/client/store';
import Subscription from '~/common/models/data/Subscription';
import AuthorEntry from '~/common/models/data/AuthorEntry';

export function loadAuthors() : models.data.AuthorEntry[]
{
    let authors : any = sessionStorage.getItem('session_data_authors');
    if (authors != null)
    {
        authors = JSON.parse(authors) as models.data.AuthorEntry[];
    }

    let authorCount = 0;
    if (authors != null)
        authorCount = authors.length;

    return authors;
}

export function loadAfter() : string
{
    return sessionStorage.getItem('session_data_after');
}

export function loadSubscriptions() : models.data.Subscription[]
{
    let subs : any = sessionStorage.getItem('session_data_subscriptions');
    if (subs != null)
    {
        subs = JSON.parse(subs) as models.data.Subscription[];
    }

    return subs;
}

export async function saveSubscriptions( getState : GetState )
{
    let state : State = getState();
    let subscriptions : Subscription[] = state.userState.subscriptions;
    sessionStorage.setItem('session_data_subscriptions', JSON.stringify(subscriptions));
}


export async function saveAuthors( getState : GetState )
{
    let state : State = getState();
    let authors : AuthorEntry[] = state.authorState.authors;
    let after = state.authorState.after;

    sessionStorage.setItem('session_data_authors', JSON.stringify(authors));
    if (after == null)
        sessionStorage.removeItem('session_data_after');
    else
        sessionStorage.setItem('session_data_after', after);
}


export function saveLastVisit( lastvisit : number)
{
    sessionStorage.setItem('session_data_last_visit', JSON.stringify(lastvisit));
}

export function loadLastVisit() : number
{
    let lastVisit : any = sessionStorage.getItem('session_data_last_visit');
    if (lastVisit != null)
    {
        lastVisit = JSON.parse(lastVisit) as number;
    }

    return lastVisit;
}

export function saveScroll( scroll : number)
{
    sessionStorage.setItem('session_data_scroll', JSON.stringify(scroll));
}


export function loadScroll() : number
{
    let scroll : any = sessionStorage.getItem('session_data_scroll');
    if (scroll != null)
    {
        scroll = JSON.parse(scroll) as number;
    }

    return scroll;
}

// Clear any data stored in session. 
// Does not affect auth info stored there.
export function clear()
{
    sessionStorage.removeItem('session_data_scroll');
    sessionStorage.removeItem('session_data_after');
    sessionStorage.removeItem('session_data_subscriptions');
    sessionStorage.removeItem('session_data_authors');
    sessionStorage.removeItem('session_data_last_visit');
}
