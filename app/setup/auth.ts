import * as redditAuth from '~/backend/authentication/redditAuth'

export async function setup()
{
    ////////////////////////////////////////
    // Clear old auth states on a loop
    ////////////////////////////////////////

    let interval : number = 1000 * 60;  //One minute.
    setInterval( async () => 
    {
        redditAuth.pruneOldAuthStates();
    }, interval);
}

