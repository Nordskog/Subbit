import * as models from '~/common/models'
import * as urls from '~/common/urls'
import * as tools from '~/common/tools'
import * as api from '~/common/api'

interface namesResponse
{
    names: string[]
}

export async function searchSubreddits(name: string, auth? : models.auth.RedditAuth ) : Promise< string[] >
{
    let url = (auth == null ? urls.REDDIT_URL : urls.REDDIT_OAUTH_API_URL) + "/api/search_reddit_names.json";


    let result : namesResponse = <namesResponse> await api.reddit.getRequest(
        url,
        {
            query: name,
            include_over_18: true
        },
        auth);
  
    return result.names;
}