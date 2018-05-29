import { Subscription } from '~/common/models/data'
import { PostDisplay } from '~/common/models';

export default interface Options
{
    subscriptions : Subscription[];
    postDisplay: PostDisplay;
}
