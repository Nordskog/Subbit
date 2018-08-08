import * as Log from '~/common/log';
import * as cluster from 'cluster'

export function setup( isDev : boolean = false)
{
    Log.init(cluster.isMaster, isDev);
}