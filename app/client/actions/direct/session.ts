import * as models from '~/common/models';
import { arch } from 'os';

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

export function saveSubscriptions( subscriptions : models.data.Subscription[] )
{
    sessionStorage.setItem('session_data_subscriptions', JSON.stringify(subscriptions));
}

export function saveAuthors( authors : models.data.AuthorEntry[], after : string )
{

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

//Clear any data stored in session. 
//Does not affect auth info stored there.
export function clear()
{
    sessionStorage.removeItem('session_data_after');
    sessionStorage.removeItem('session_data_subscriptions');
    sessionStorage.removeItem('session_data_authors');
    sessionStorage.removeItem('session_data_last_visit');
}