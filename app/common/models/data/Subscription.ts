import SubscriptionSubreddit from './SubscriptionSubreddit';

 export interface Subscription
{
    subscribed? : boolean;  // Consider true if null
    user: string;
    author: string;
    id: number;
    subreddits: SubscriptionSubreddit[];
}

export namespace Subscription 
{
    export function getNew( author : string, existingSubscription : Subscription,  removeSubreddit : string, ...newSubreddits : string[])
{
    let id = null;
    let user = null;

    if (existingSubscription != null)
    {
        id = existingSubscription.id;
        user = existingSubscription.user;
        author = existingSubscription.author;

        for (let subSubreddit of existingSubscription.subreddits)
        {
            newSubreddits.push( subSubreddit.name );
        }
    }

    if (removeSubreddit != null )
    {
        newSubreddits = existingSubscription.subreddits
        .filter( (subsub) => subsub.name.toLowerCase() !== removeSubreddit.toLowerCase() )
        .map( (subsub) => subsub.name );
    }

    return {
        author: author,
        subscribed: true,
        id: id,
        user: user,
        subreddits: newSubreddits.map( (name) => 
            {
                return {
                    id: null,
                    name: name,
                    subscribed: true
                };
            })
    };
}

}
