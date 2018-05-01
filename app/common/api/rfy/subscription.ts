import * as serverActions from '~/backend/actions'
import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as api from '~/common/api'


require('isomorphic-fetch');

export function subscribe(user: string, author: string, access_token: string): Promise<models.data.Subscription>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.ADD_SUBSCRIPTION,
            payload : < serverActions.subscription.ADD_SUBSCRIPTION >
            {
                author: author,
                user: user
            }
        },
        access_token );
}

export function unsubscribe(subscriptionId: number, access_token: string) : Promise<boolean>
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
        access_token );
}

export function addSubreddit(subscriptionId: number, subredditId: number, access_token: string) : Promise<models.data.Subscription>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT,
            payload : < serverActions.subscription.ADD_SUBSCRIPTION_SUBREDDIT >
            {
                id: subscriptionId,
                subreddits: [
                    {
                        id: subredditId,
                    }
                ],
            }
        },
        access_token );
}

export function removeSubreddit(subscriptionId: number, subredditId: number, access_token: string) : Promise<models.data.Subscription>
{
    return api.rfy.postRequest(
        '/subscription', 
        {
            type :    serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT,
            payload : < serverActions.subscription.REMOVE_SUBSCRIPTION_SUBREDDIT >
            {
                id: subscriptionId,
                subreddits: [
                    {
                        id: subredditId,
                    }
                ],
            }
        },
        access_token );
}