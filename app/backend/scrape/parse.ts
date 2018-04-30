import { Wetland, QueryBuilder, EntityRepository, EntityManager, Scope, ArrayCollection } from 'wetland';
import * as models from '~/common/models'
import * as entities from '~/backend/entity'
import * as tools from '~/common/tools'
import * as Scrape from '~/backend/scrape'

export async function parsePostBatch(wetland : Wetland, subreddit: entities.Subreddit, postsJson, skipExisting : boolean = false) : Promise< { last_created_utc:number, processed_count :number, error : boolean} >
{
    let manager : Scope = wetland.getManager();

    let authors = manager.getRepository(entities.Author);
    let posts = manager.getRepository(entities.Post);

    //If the list is empty this remains at 0, and the parent will break.
    let batchLastPostTime : number = 0;
    let batchError : boolean = false;

    for (var i = 0; i < postsJson.length; i++)
    {
        let {lastPostTime, error } = await parseSinglePost(manager, subreddit, postsJson[i], skipExisting);
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
async function parseSinglePost( manager: Scope, subreddit: entities.Subreddit, postData : models.reddit.RedditPost, skipExisting : boolean = false) : Promise<{lastPostTime : number, error : boolean}>
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
            author.posts = new ArrayCollection;
            author.in_subreddit = new ArrayCollection;
            author.name = postData.author;
    
            manager.persist(author);
            author = manager.attach(author,true);
            await manager.flush();
        }
    
        let authorInSubreddit = await manager.getRepository(entities.SubredditAuthor).findOne({ 'author_id': author.id, 'subreddit_id':subreddit.id });
    
        if (authorInSubreddit == null)
        {
            authorInSubreddit = new entities.SubredditAuthor;
            authorInSubreddit.author_id = author.id;
            authorInSubreddit.subreddit_id = subreddit.id;
            authorInSubreddit.last_post_date = new Date(postData.created_utc * 1000);
    
            manager.persist(authorInSubreddit);
            authorInSubreddit = manager.attach(authorInSubreddit,true);
            await manager.flush();
        }

    
        let post : entities.Post = await manager.getRepository(entities.Post).findOne({ 'post_id': postData.id });
        let newPost : boolean = false;
        if ( post == null)
        {
            newPost = true;
            post = new entities.Post;

            //Content. Reddit responses will sometimes include \u0000 null chars, which postgres can't handle.
            post.title = tools.removeNullChars(postData.title);
            post.post_id = postData.id;
            post.created_utc = new Date(postData.created_utc * 1000);
            post.link_flair_text = tools.removeNullChars(postData.title);
            post.selftext = tools.removeNullChars(postData.title);
            post.is_self = postData.is_self;
            post.thumbnail = tools.removeNullChars(postData.title);
            post.url = tools.removeNullChars(postData.title);
            
            //Relations
            post.author_id = author.id;
            post.subreddit_id = subreddit.id;

            //Don't persist until end incase something breaks
            manager.persist(post);
        }

        //Set or update score / comment count
        if (newPost || !skipExisting)
        {
            //Post
            post.num_comments = postData.num_comments;
            post.score = postData.score;
            post.hot_score = Scrape.tools.calculateHotScore(post.score, postData.created_utc);

            //Score and post time for author and subreddit            
            if (authorInSubreddit.hot_score < post.hot_score)
                authorInSubreddit.hot_score = post.hot_score; 


            if (authorInSubreddit.last_post_date < post.created_utc)
                authorInSubreddit.last_post_date = post.created_utc;
        }
    }
    catch (err)
    {
        console.log("Problem creating or updating post: ", err);
        throw new Error(err.message);
    }

    return {lastPostTime: lastPostTime, error: error};
}
