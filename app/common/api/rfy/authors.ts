import { AuthorFilter } from '~/common/models';
import * as models from '~/common/models'
import * as api from '~/common/api'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import * as requests from '~/backend/actions'
import * as serverActions from '~/backend/actions'

require('isomorphic-fetch');

export async function fetchSubscribedAuthors( access_token: string, count? : number, page? : number ): Promise<models.data.Author[]>
{
    //Typescript isn't resolving the return type properly
    let subs : models.data.Subscription[] = <models.data.Subscription[]> await api.rfy.getRequest(
        '/subscription', 
        {
            "page": page,
            "count": count,
        },
        access_token);

    return subs.map( ( sub : models.data.Subscription ) => 
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
}

export function pruneAuthorsWithNoPosts(subreddit_id? : number,  access_token? : string) : Promise<boolean>
{
    return api.rfy.postRequest(
        '/authors', 
        {
            type :    serverActions.author.PRUNE_AUTHORS_WITH_NO_POSTS,
            payload : < serverActions.author.PRUNE_AUTHORS_WITH_NO_POSTS >
            {
                subreddit_id : subreddit_id
            }
        },
        access_token );
}

