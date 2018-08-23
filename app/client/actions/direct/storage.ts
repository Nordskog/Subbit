export function saveLastVisit( lastvisit : number)
{
    localStorage.setItem('session_data_last_visit', JSON.stringify(lastvisit));
}

export function loadLastVisit() : number
{
    let lastVisit : any = localStorage.getItem('session_data_last_visit');
    if (lastVisit != null)
    {
        lastVisit = JSON.parse(lastVisit) as number;
    }

    return lastVisit;
}
