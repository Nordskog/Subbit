import * as serverActions from '~/backend/actions';
import * as models from '~/common/models';
import * as api from '~/common/api';


export function fetchSubscriptions( accessToken: string ): Promise<models.data.Subscription[]>
{
    return api.rfy.getRequest(
        '/subscription', 
        {

        },
        accessToken);
}

export function subscribe(user: string, author: string, accessToken: string, subreddits : string[]): Promise<models.data.Subscription>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.ADD_SUBSCRIPTION,
            payload : < serverActions.subscription.ADD_SUBSCRIPTION >
            {
                author: author,
                user: user,
                subreddits: subreddits
            }
        },
        accessToken );
}

export function unsubscribe(subscriptionId: number, accessToken: string) : Promise<boolean>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.REMOVE_SUBSCRIPTION,
            payload : < serverActions.subscription.REMOVE_SUBSCRIPTION >
            {
                id: subscriptionId,
            }
        },
        accessToken );
}

export function addSubreddit(subscription: number, subreddit: string, accessToken: string) : Promise<models.data.Subscription>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT,
            payload : <  serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT >
            {
                id: subscription,
                subreddit: subreddit,
            }
        },
        accessToken );
}

export function removeSubreddit(subscription: number, subreddit: string, accessToken: string) : Promise<models.data.Subscription>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT,
            payload : < serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT >
            {
                id: subscription,
                subreddit: subreddit  
            }
        },
        accessToken );
}
