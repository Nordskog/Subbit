import SubscriptionSubreddit from './SubscriptionSubreddit'

export default interface Subscription
{
    user: string;
    author: string;
    id: number;
    subreddits: SubscriptionSubreddit[];
}