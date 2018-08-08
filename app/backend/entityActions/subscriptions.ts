import * as Entities from '~/backend/entity'
import * as Wetland from 'wetland'
import { EndpointException, Exception } from '~/common/exceptions';
import * as api from '~/common/api';
import * as RFY from '~/backend/rfy'
import * as Log from '~/common/log';
import * as tools from '~/common/tools'


function throwIfIllegalCharacters( str : string)
{
    if ( !tools.string.confirmAlphaNumericDashUnderscore( str ) )
    {
        throw new EndpointException(400, `Input contained illegal characters: ${str}`);
    }
}

//None of these methods will flush the manager

export async function getSubscription(manager : Wetland.Scope, subscription_id : number, user? : Entities.User) : Promise<Entities.Subscription>
{
    let options : any = { populate : [ 'subreddits', 'author', 'user'] };
    let sub : Entities.Subscription = await manager.getRepository(Entities.Subscription).findOne({ id: subscription_id }, options );

    if (sub != null && user != null)
    {
        if (user.id != sub.user.id)
        {
            throw new EndpointException( 403, "Attempted to get subscription belonging to different user");
        }

        sub.user = user;
    }

    return sub;
}

export async function getNewSubscription( manager : Wetland.Scope,  user : Entities.User, author_name : string, ...subreddit_names : string[]  ) : Promise<Entities.Subscription>
{
    throwIfIllegalCharacters(author_name);

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
            //User may have multiple tabs open and subscribe in one but not the other.
            //Act as if everything is okay and just update with new subreddits.
            //Existing sub may have subreddits listed. They will be kept.
            Log.I(`User already subscribed to author: ${author_name}`);
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
    if (subreddit_names != null && subreddit_names.length > 0)
        await addSubredditToSubscription(manager, sub, ...subreddit_names);

    return sub;
}

export async function addSubredditToSubscription( manager : Wetland.Scope, sub : Entities.Subscription, ...subreddit_names : string[] )
{


    //Reddit limits the search string to something like 1600 characters.
    //The actual limit assuming max subreddit name length is closer to 23? 25? I think,
    //but let's play it safe and limit to 20.
    if (sub.subreddits.length >= 20)
    {
        throw new EndpointException(400, "Reached max number of subscribed subreddits for author")
    }

    //Confirm valid subreddit names (characters, no if it exists)
    //Convert to lowercase, remove duplicates
    let nameSet : Map<string, string> = new Map<string, string>();
    subreddit_names.forEach( ( name : string ) => 
    { 
        throwIfIllegalCharacters(name);
        nameSet.set(name.toLowerCase(), name) } 
    );

    //Remove any subreddits we are already subscribed to from set
    sub.subreddits.forEach( ( subreddit : Entities.Subreddit ) =>  nameSet.delete(subreddit.name_lower ) );
        
    //Get as array
    let uniqueLowerNames = [];
    nameSet.forEach( ( name: string, lower : string) =>
    {
        uniqueLowerNames.push(lower);
    });

    let subreddits : Entities.Subreddit[] = await manager.getRepository(Entities.Subreddit).find({ name_lower: uniqueLowerNames }, { }) || [];
    
    //Map names to existing subreddits
    let subredditMap : Map<string, Entities.Subreddit> = new Map<string, Entities.Subreddit>();
    subreddits.forEach( ( subreddit : Entities.Subreddit ) => subredditMap.set( subreddit.name_lower, subreddit) );

    for ( let  [lower, name] of nameSet )   //Note that arg order (key, value) is opposite of forEach callback
    {
        //Get existing subreddit from map, create if new
        let subreddit : Entities.Subreddit = subredditMap.get(lower);
        if (subreddit == null)
        {
            subreddit = new Entities.Subreddit();

            subreddit.name = name;  
            manager.persist(subreddit);

            //Async confirm with reddit that subreddit exists and casing is correct.
            //Runs a network request so work here should finished before it accesses db to make corrections.
            //do not await.
            confirmSubreddit(name);
        }

        //and finally add to sub list
        sub.subreddits.add(subreddit);

    };
}

export async function removeSubredditFromSubscription( manager : Wetland.Scope, sub : Entities.Subscription, subreddit_name : string )
{
    throwIfIllegalCharacters(subreddit_name);
    let subreddit : Entities.Subreddit = await manager.getRepository(Entities.Subreddit).findOne({ name_lower: subreddit_name.toLowerCase() }, { });

    if ( subreddit != null)
        sub.subreddits.remove(subreddit);
}

export async function getCount(manager : Wetland.Scope)
{
    let queryBuilder : Wetland.QueryBuilder<Entities.Subscription> = manager.getRepository(Entities.Subscription).getQueryBuilder("sub");

    let count : number = await queryBuilder
                        .select({count: 'sub.id'})
                        .getQuery()
                        .getSingleScalarResult();

    //Wetland typings wrong, returns string of value
    if ( typeof count == "string")
        count = Number.parseInt(count as any);
        
    return count;
}

//A user may attempt to subscribe to a subreddit that does not exist.
//They may also provide the subreddit name with incorrect casing.
//Confirm new subreddits with reddit and update/delete accordingly.
//this one does FLUSH!
export async function confirmSubreddit( name : string )
{

    
    let casedName = await api.reddit.subreddits.getNameIfExists(name);

    if ( casedName === null || casedName !== name)
    {

        let manager : Wetland.Scope =  RFY.wetland.getManager();
        let subreddit : Entities.Subreddit = await manager.getRepository(Entities.Subreddit).findOne( { "name_lower" : name.toLowerCase() }, {} );
        
        if (subreddit == null)
        {
            Log.E(`Attempted to confirm subreddit on subreddit that does not exist: ${name}`);
            return;
        }

        if (casedName === null)
        {
            Log.W(`User attempted to subscribe to subreddit that does not exist: ${name}`);
            manager.remove(subreddit);
        }
        else if ( casedName != name )
        {
            //Subreddit exists but casing is wrong. Correct!
            Log.I(`User provided wrong subreddit case for: ${name}, corrected to: ${casedName}`);
            subreddit.name = casedName;
        }
        else
        {
            //No need to flush.
            return;
        }

        await manager.flush();
    }
}