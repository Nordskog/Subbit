import * as models from '~/common/models'
import * as api from '~/common/api'
import { State } from '~/client/store';
import * as authority from '~/client/authority'
import * as actions from '~/client/actions'
import config from 'root/config'


export async function getAuthors( dispatch, getState )
{
    let state: State = getState();

    let redditAuth = await actions.directActions.authentication.retrieveAndUpdateRedditAuth( dispatch, state);

    let authors : models.data.Author[];
    let after : string;

    if (state.authorState.author != null)
    {
        //Single author
        authors = [{
            id : -1,
            name: state.authorState.author, //Need to correct lookup name maybe
            last_post_date: 0,
            post_count : 0,
            posts: [],
            subscriptions: []
        }]
    }    
    else if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
    {
        //Subscriptions
        authors = state.userState.subscriptions.map( ( sub : models.data.Subscription ) => 
        {
            return {
                    id : -1,
                    name: sub.author,
                    last_post_date: 0,
                    post_count : 0,
                    posts: [],
                    subscriptions: []
                }
        });
        after = null;
    }
    else
    {
        //Subreddit
        let res = await api.reddit.posts.getAuthors( true, state.authorState.subreddit, state.authorState.filter, state.authorState.after, config.client.authorDisplayCount, redditAuth );
        authors = res.authors;
        after = res.after;
    }

    let returnedAuthorCount = authors.length;

    //Remove and any existing authors, then update authority with new
    authors = authors.filter( (author : models.data.Author) => { return !authority.author.authorityContains(author) } )

    authors.forEach( ( author : models.data.Author ) => { authority.author.updateAuthority(author) } );

    let authorEntries : models.data.AuthorEntry[] = authors.map( ( author : models.data.Author ) => 
    {
        return {
            author: author,
            subscription: null,
            after: null,
            end: true
        }
    } ); 

    await actions.directActions.authors.populateAuthorSubscriptions(authorEntries, getState);   //Important to do this before getting posts
    await actions.directActions.authors.poulateInitialPosts(authorEntries, config.client.postDisplayCount, dispatch, getState);

    if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
    {
        authorEntries.sort( (a : models.data.AuthorEntry, b: models.data.AuthorEntry) => 
        {
            let aCreated = a.author.posts.length > 0 ? a.author.posts[0].created_utc : 0;
            let bCreated = b.author.posts.length > 0 ? b.author.posts[0].created_utc : 0;

            if (aCreated > bCreated)
                return -1;
            if (aCreated < bCreated)
                return 1;
            return 0;
        });
    }

    return { authorEntries : authorEntries, after : after  };
}

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

export function updateLoadingProgress (count : number, progress : number, dispatch)
{
    dispatch
    ({ 
            type: actions.types.page.LOADING_PROGRESS,
            payload: 
            { 
                loadingProgress: progress, 
                loadingCount: count 
            } as actions.types.page.LOADING_PROGRESS
    });
}

export async function poulateInitialPosts(authors : models.data.AuthorEntry[], count : number, dispatch, getState)
{
        let state: State = getState();

        let redditAuth = null;
        if (state.authState.isAuthenticated)
            redditAuth = state.authState.user.redditAuth;

        let authorCount : number = authors.length;
        let authorCompletedCount : number = 0;

        let proms : Promise<void>[] = [];
        authors.forEach( ( author : models.data.AuthorEntry ) => 
        {
            let subreddits : string[] = [];
            if (state.authorState.filter == models.AuthorFilter.SUBSCRIPTIONS)
            {
                //Well that shouldn't happen
                if (author.subscription == null)
                    return;

                subreddits = author.subscription.subreddits.map( (subreddit : models.data.SubscriptionSubreddit) => 
                {
                    return subreddit.name;
                } )
            }
            else
            {
                if (state.authorState.subreddit != null)
                subreddits = [state.authorState.subreddit];
            }

            let prom = new Promise<void>( (resolve, reject) => 
            {
                api.reddit.posts.getPosts(author.author.name, author.after, redditAuth, count, ...subreddits).then( ( {posts, after } ) => 
                {    
                    author.after = after;;
                    author.end = after == null;

                    //Don't overwrite if we don't find any posts.
                    //May be seeded with normal listing results.
                    if (posts.length > 0)
                        author.author.posts = posts;

                    authorCompletedCount++;
                    updateLoadingProgress(authorCount, authorCompletedCount, dispatch);

                    resolve();
                });
            });

            proms.push(prom);

        });

        //Process any remaining
        await Promise.all(proms);


}