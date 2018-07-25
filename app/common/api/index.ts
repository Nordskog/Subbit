import * as rfy from './rfy';
import * as reddit from './reddit'

export
{   
    rfy,
    reddit
}


export function cancelAll()
{
   reddit.clearQueue();
}
