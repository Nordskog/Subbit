import { Subscription } from '~/common/models/data'
import { PostDisplay } from '~/common/models';
import UserSettings from '~/common/models/data/UserSettings';

export default interface Options
{
    subscriptions : Subscription[];
    lastVisit: number;
    settings : UserSettings;
}
