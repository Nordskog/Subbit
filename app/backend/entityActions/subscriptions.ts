import * as Entities from '~/backend/entity'
import * as Wetland from 'wetland'

//None of these methods will flush the manager

export async function getSubscription(manager : Wetland.Scope, subscription_id : number, user? : Entities.User) : Promise<Entities.Subscription>
{
    let options : any = { populate : [ 'subreddits', 'author', 'user'] };
    let sub : Entities.Subscription = await manager.getRepository(Entities.Subscription).findOne({ id: subscription_id }, options );

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

export async function getNewSubscription( manager : Wetland.Scope,  user : Entities.User, author_name : string, ...subreddit_names : string[]  ) : Promise<Entities.Subscription>
{
    let sub : Entities.Subscription;
    let author : Entities.Author = await manager.getRepository(Entities.Author).findOne({ name_lower: author_name.toLowerCase() }, { });
    if (author == null)
    {
        //Author doesn't exist, sub also doesn't exist.
        author = new Entities.Author();
        author.name = author_name;
        manager.persist(author);
    }
    else
    {
        //Check if subscription already exists
        sub = await manager.getRepository(Entities.Subscription).findOne({ user_id: user.id, author_id: author.id }, { populate: [ 'subreddits', 'author'] })

        if (sub != null)
        {
            throw new Error("User already subscribed to author");
        }
    }

    //No existing subscription
    if (sub == null)
    {
        sub = new Entities.Subscription();
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
    if (subreddit_names != null)
        await addSubredditToSubscription(manager, sub, ...subreddit_names);

    return sub;
}

export async function addSubredditToSubscription( manager : Wetland.Scope, sub : Entities.Subscription, ...subreddit_names : string[] )
{
    

    //Convert to lowercase, remove duplicates
    let nameSet : Set<String> = new Set<string>();
    subreddit_names.forEach( name => nameSet.add(name.toLowerCase()) );

    //Remove any subreddits we are already subscribed to from set
    sub.subreddits.forEach( ( subreddit : Entities.Subreddit ) =>  nameSet.delete(subreddit.name_lower ) );
        
    //Get existing subreddits
    let subreddits : Entities.Subreddit[] = await manager.getRepository(Entities.Subreddit).find({ name_lower: Array.from(nameSet) }, { }) || [];
    
    //Map names to existing subreddits
    let subredditMap : Map<string, Entities.Subreddit> = new Map<string, Entities.Subreddit>();
    subreddits.forEach( ( subreddit : Entities.Subreddit ) => subredditMap.set( subreddit.name_lower, subreddit) );

    nameSet.forEach( (name : string) => 
    {
        //Get existing subreddit from map, create if new
        let subreddit : Entities.Subreddit = subredditMap.get(name);
        if (subreddit == null)
        {
            subreddit = new Entities.Subreddit();
            subreddit.name = name;
            manager.persist(subreddit);
        }

        //and finally add to sub list
        sub.subreddits.add(subreddit);

    });
}

export async function removeSubredditFromSubscription( manager : Wetland.Scope, sub : Entities.Subscription, subreddit_name : string )
{
    let subreddit : Entities.Subreddit = await manager.getRepository(Entities.Subreddit).findOne({ name_lower: subreddit_name.toLowerCase() }, { })
    sub.subreddits.remove(subreddit);
}