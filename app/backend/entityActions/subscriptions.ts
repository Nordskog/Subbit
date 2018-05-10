import * as entities from '~/backend/entity'
import * as Wetland from 'wetland'

export async function getSubscription(manager : Wetland.Scope, subscription_id : number, user? : entities.User) : Promise<entities.Subscription>
{
    let options : any = { populate : [ 'subreddits', 'author', 'user'] };
    let sub : entities.Subscription = await manager.getRepository(entities.Subscription).findOne({ id: subscription_id }, options );

    if (sub != null && user != null)
    {
        console.log("sub");

        if (user.id != sub.user.id)
        {
            throw new Error("Attempted to get subscription belonging to different user");
        }

    
        sub.user = user;
    }

    return sub;
}

export async function getNewSubscription( manager : Wetland.Scope,  user : entities.User, author_name : string, subreddit_name? : string  ) : Promise<entities.Subscription>
{
    let sub : entities.Subscription;
    let author : entities.Author = await manager.getRepository(entities.Author).findOne({ name_lower: author_name.toLowerCase() }, { });
    if (author == null)
    {
        //Author doesn't exist, sub also doesn't exist.
        author = new entities.Author();
        author.name = author_name;
        manager.persist(author);
    }
    else
    {
        //Check if subscription already exists
        sub = await manager.getRepository(entities.Subscription).findOne({ user_id: user.id, author_id: author.id }, { populate: [ 'subreddits', 'author'] })

        if (sub != null)
        {
            throw new Error("User already subscribed to author");
        }
    }

    //No existing subscription
    if (sub == null)
    {
        sub = new entities.Subscription();
        sub.author = author;
        sub.user = user;
        sub.subreddits = new Wetland.ArrayCollection();
        manager.persist(sub);
    }
    else
    {
        //Rather than querying it
        sub.user = user;
    }

    //If none specified, user will be subscribed to all of author's posts
    if (subreddit_name != null)
        await addSubredditToSubscription(manager, sub, subreddit_name);

    return sub;
}

export async function addSubredditToSubscription( manager : Wetland.Scope, sub : entities.Subscription, subreddit_name : string )
{
    let subreddit : entities.Subreddit;
        
    subreddit = await manager.getRepository(entities.Subreddit).findOne({ name_lower: subreddit_name.toLowerCase() }, { })

    if (subreddit == null)
    {
        subreddit = new entities.Subreddit();
        subreddit.name = subreddit_name;
        manager.persist(subreddit);
    }

    //Add to sub's subreddits if not already present
    if (subreddit != null)
    {
        //Only add if it doesn't already exist
        if ( sub.subreddits.findIndex( ( existingSubreddit : entities.Subreddit ) => { return existingSubreddit.id == subreddit.id } )  < 0 )
        {
            sub.subreddits.add(subreddit);
        }
        else
        {
            throw new Error("User already subscribed to author in this subreddit");
        }
    }
}

export async function removeSubredditFromSubscription( manager : Wetland.Scope, sub : entities.Subscription, subreddit_name : string )
{
    let subreddit : entities.Subreddit = await manager.getRepository(entities.Subreddit).findOne({ name_lower: subreddit_name.toLowerCase() }, { })
    sub.subreddits.remove(subreddit);
}