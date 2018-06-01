export import rfy = require('./rfy');
export import reddit = require('./reddit');

export function cancelAll()
{
   reddit.clearQueue();
}
