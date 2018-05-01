import * as urls from '~/common/urls';
import * as tools from '~/common/tools';
import * as api from '~/common/api'
import * as models from '~/common/models'

export async function logout() : Promise<boolean>
{
    console.log("logout remote called");

    //Typings are fucked, body below won't take a direct string
    let credentials: RequestCredentials = 'same-origin';
    let config = {
        method: 'GET',
        credentials: credentials,
    }

    let response = await fetch(urls.getLogoutUrl(), config);

    return (response.ok);
}

export function refreshRedditAccessToken(user: string, access_token : string) : Promise<models.auth.RedditAuth>
{
    return api.rfy.getRequest(
        '/authorize_refresh', 
        {
            "user": user,
        },
        access_token    );
}


export function getAndUpdateLastVisit(access_token : string) : Promise<number>
{
    return api.rfy.getRequest(
        '/user/last_visit', 
        {

        },
        access_token );
}