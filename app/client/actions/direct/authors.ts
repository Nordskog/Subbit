import * as models from '~/common/models'
import * as api from '~/common/api'
import { State } from '~/client/store';
import * as authority from '~/client/authority'
import * as clientTools from '~/client/tools'
import * as cache from '~/client/cache'

export function populateAuthorSubscriptions( authors : models.data.AuthorEntry[], getState )
{
    let subscriptions : models.data.Subscription[] = (<State> getState()).userState.subscriptions;
    //let subMap : Map<string, models.data.Subscription> = new Map<string, models.data.Subscription>();

    let subMap : Map<string, models.data.Subscription> = new Map( subscriptions.map( 
        ( sub: models.data.Subscription ): [string, models.data.Subscription] => [sub.author, sub] ) );

    authors.forEach( ( author : models.data.AuthorEntry ) => 
    {
        author.subscription =  subMap.get( author.author.name );
    });
}

export async function poulateInitialPosts(authors : models.data.AuthorEntry[], count : number, dispatch, getState)
{
        let state: State = getState();
        let proms : Promise<void>[] = [];
        authors.forEach( ( author : models.data.AuthorEntry ) => 
        {
            //TODO deal with subscriptions
            let subreddits : string[] = [];
            if (state.authorState.subreddit != null)
                subreddits = [state.authorState.subreddit];

            let prom = new Promise<void>( (resolve, reject) => 
            {
                api.reddit.getPosts(author.author.name, author.after, null, count, ...subreddits).then( ( {posts, after } ) => 
                {
                    posts.forEach( ( post : models.reddit.Post ) => 
                    {
                        authority.post.updateAuthority(post);
                    });

                    cache.post.populatePostsFromCache(posts);
                    clientTools.PostInfoQueue.addAuthorToQueue(author.author.name, posts, dispatch);
    
                    author.after = after;;
                    author.end = after == null;
                    author.author.posts = posts;

                    resolve();
                });
            });

            proms.push(prom);

        });

        //Process any remaining
        await Promise.all(proms);
}