import { Subscription, ImportedSubscription } from '~/common/models/data';
import { PostDisplay } from '~/common/models';
import UserSettings from '~/common/models/data/UserSettings';
import { ImportStatus } from '~/common/models/reddit';

export default interface Options
{
    subscriptions : Subscription[];
    lastVisit: number;
    settings : UserSettings;
    importedSubscriptions: ImportedSubscription[];
}
