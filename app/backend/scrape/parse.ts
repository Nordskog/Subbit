import { Wetland, QueryBuilder, EntityRepository, EntityManager, Scope, ArrayCollection } from 'wetland';
import * as models from '~/common/models'
import * as entities from '~/backend/entity'
import * as tools from '~/common/tools'
import * as Scrape from '~/backend/scrape'
import { subreddit } from 'css/manager.scss';

export async function parsePostBatch(wetland : Wetland, posts : models.reddit.Post[])
{
    let manager : Scope = wetland.getManager();
    let authorRepo = manager.getRepository(entities.Author);

    //Check if we are tracking any of these auhors
    let postAuthorNames : string[] = posts.map( ( post : models.reddit.Post ) => { return post.author.toLowerCase() } );

    console.log("authors to look for: ",postAuthorNames);

    let authors : entities.Author[] = await authorRepo.find( { name_lower : postAuthorNames }, { populate: ['in_subreddit', 'in_subreddit.subreddit'] } ) || [];

    console.log("authors: ",authors.length);

    //We are! maybe
    if (authors.length > 0)
    {
        //Get a list of subreddits we are already tracking
        let subredditMap : Map<String, entities.Subreddit> = new  Map<String, entities.Subreddit>();
        {
            let postSubredditNames : string[] = posts.map( ( post : models.reddit.Post ) => { return post.subreddit.toLowerCase() } );
            let subreddits : entities.Subreddit[] = await manager.getRepository(entities.Subreddit).find( { name_lower : [postSubredditNames] }, { } ) || [];
            subreddits.forEach( ( subreddit : entities.Subreddit ) => 
            {
                subredditMap.set( subreddit.name_lower, subreddit );
            });
        }

        //Create a map so we can easily lookup posts for each author
        let postMap : Map<String, models.reddit.Post[]> = new Map<String, models.reddit.Post[]>();
        posts.forEach( ( post : models.reddit.Post ) => 
        {
            let authorPostMap = postMap.get(post.author.toLowerCase());
            if (authorPostMap == null)
            {
                authorPostMap = [];
                postMap.set(post.author.toLowerCase(), authorPostMap);
            }
            authorPostMap.push(post);
        });

        //Update last post dates
        authors.forEach( ( author : entities.Author ) => 
        {
            let authorPostMap = postMap.get(author.name_lower);
            authorPostMap.forEach( ( post : models.reddit.Post ) => 
            {
                let date : Date = new Date(post.created_utc * 1000);

                //Update last post date for author
                if (author.last_post_date < date)
                    author.last_post_date = date;

                //And then subreddit
                let in_subreddit = null;



                //First post by this author in this subreddit. Create!
                if (in_subreddit == null)
                {
                    //in_subreddit = new entities.SubredditAuthor();
                    manager.persist(in_subreddit);
                    in_subreddit.last_post_date = date;
                    in_subreddit.author = author;
                    
                    in_subreddit.subreddit = subredditMap.get(post.subreddit.toLowerCase());
                    if (in_subreddit.subreddit == null)
                    {
                        //Entirely new subreddit!
                        in_subreddit.subreddit = new entities.Subreddit();
                        manager.persist(in_subreddit.subreddit);
                        in_subreddit.subreddit.name = post.subreddit;
                        in_subreddit.subreddit.name = post.subreddit.toLowerCase();

                        subredditMap.set(in_subreddit.subreddit.name_lower, in_subreddit.subreddit);
                    }

                }
                else
                {
                    if (in_subreddit.last_post_date < date)
                    in_subreddit.last_post_date = date;
                }
            });
        });

        await manager.flush();
    }
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
            //let authorInSubreddit = await manager.getRepository(entities.SubredditAuthor).findOne({ 'author_id': author.id, 'subreddit_id':subreddit.id });
            let postedDate : Date = new Date(postData.created_utc * 1000);
    
            //if (authorInSubreddit == null)
            {
                //authorInSubreddit = new entities.SubredditAuthor;
                //authorInSubreddit.author_id = author.id;
               // authorInSubreddit.subreddit_id = subreddit.id;
               // authorInSubreddit.last_post_date = postedDate;
        
                //manager.persist(authorInSubreddit);
               // authorInSubreddit = manager.attach(authorInSubreddit,true);
                await manager.flush();
            }
            //else
            {
                //if (authorInSubreddit.last_post_date < postedDate)
                 //   authorInSubreddit.last_post_date = postedDate;
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
