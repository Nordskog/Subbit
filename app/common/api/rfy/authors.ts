import { AuthorFilter } from '~/common/models';
import * as models from '~/common/models'
import * as api from '~/common/api'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import * as requests from '~/backend/actions'
import * as serverActions from '~/backend/actions'

require('isomorphic-fetch');

export function fetchAuthors(filter: string, subreddit: string, author : string, page = 0, access_token?: string) : Promise< models.data.AuthorEntry[]>
{    
    return api.rfy.getRequest(
        '/authors', 
        {
            "filter": filter,
            "page": page,
            "subreddit": subreddit,
            "author": author
        },
        access_token    );
}

export function fetchSubscription(subscription : number, filter: string, subreddit: string, access_token?: string ) : Promise<models.data.AuthorEntry[]>
{
   return api.rfy.getRequest(
    '/authors', 
    {
        "filter": filter,
        "subscription": subscription,
        "subreddit": subreddit
    },
    access_token    );
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

