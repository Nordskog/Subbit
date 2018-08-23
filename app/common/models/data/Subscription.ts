import SubscriptionSubreddit from './SubscriptionSubreddit';

export default interface Subscription
{
    subscribed? : boolean;  // Consider true if null
    user: string;
    author: string;
    id: number;
    subreddits: SubscriptionSubreddit[];
}
