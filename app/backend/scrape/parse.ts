import { Wetland, QueryBuilder, EntityRepository, EntityManager, Scope, ArrayCollection } from 'wetland';
import * as models from '~/common/models'
import * as entities from '~/backend/entity'
import * as tools from '~/common/tools'
import * as Scrape from '~/backend/scrape'

export async function parsePostBatch(wetland : Wetland, subreddit: entities.Subreddit, postsJson, skipNewAuthors : boolean = true) : Promise< { last_created_utc:number, processed_count :number, error : boolean} >
{
    let manager : Scope = wetland.getManager();

    let authors = manager.getRepository(entities.Author);
    let posts = manager.getRepository(entities.Post);

    //If the list is empty this remains at 0, and the parent will break.
    let batchLastPostTime : number = 0;
    let batchError : boolean = false;

    for (var i = 0; i < postsJson.length; i++)
    {
        let {lastPostTime, error } = await parseSinglePost(manager, subreddit, postsJson[i], skipNewAuthors);
        batchLastPostTime = lastPostTime;
        batchError = error;

        if (error)
            break;
    }

    if (!batchError)
    {
    //Flush batch to database
    await manager.flush().catch((err: Error) =>
    {
        console.log("Problem flushing post batch: " + err);
        throw new Error(err.message);
    });
    }
    manager.clear();


    return {last_created_utc : batchLastPostTime, processed_count: postsJson.length, error : batchError };
}

//Takes a reddit or pushshift post item
async function parseSinglePost( manager: Scope, subreddit: entities.Subreddit, postData : models.reddit.Post, skipNewAuthors : boolean = true) : Promise<{lastPostTime : number, error : boolean}>
{
    //We return the created_utc of the oldest post, or 0
    let lastPostTime = 0;
    let error : boolean = false;

    try
    {
        lastPostTime = postData.created_utc;

        let author = await manager.getRepository(entities.Author).findOne({ 'name': postData.author });
    
        if (!author)
        {
            
            author = new entities.Author;
            author.in_subreddit = new ArrayCollection;
            author.name = postData.author;
    
            if (!skipNewAuthors)
            {
                manager.persist(author);
                author = manager.attach(author,true);
                await manager.flush();
            }
        }

        if (author != null)
        {
            let authorInSubreddit = await manager.getRepository(entities.SubredditAuthor).findOne({ 'author_id': author.id, 'subreddit_id':subreddit.id });
            let postedDate : Date = new Date(postData.created_utc * 1000);
    
            if (authorInSubreddit == null)
            {
                authorInSubreddit = new entities.SubredditAuthor;
                authorInSubreddit.author_id = author.id;
                authorInSubreddit.subreddit_id = subreddit.id;
                authorInSubreddit.last_post_date = postedDate;
        
                manager.persist(authorInSubreddit);
                authorInSubreddit = manager.attach(authorInSubreddit,true);
                await manager.flush();
            }
            else
            {
                if (authorInSubreddit.last_post_date < postedDate)
                    authorInSubreddit.last_post_date = postedDate;
            }
        }
    }
    catch (err)
    {
        console.log("Problem creating or updating post: ", err);
        throw new Error(err.message);
    }

    return {lastPostTime: lastPostTime, error: error};
}
