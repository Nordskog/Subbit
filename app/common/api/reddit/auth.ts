import * as models from '~/common/models';
import { reddit } from '~/common/models';

import * as urls from '~/common/urls';
import * as tools from '~/common/tools';

import * as api from '~/common/api';

export async function authenticateWithCode(code : string, redirect : string, appBasicAuthHeader ) : Promise<models.reddit.Token>
{
     return <models.reddit.Token> await api.reddit.postRequest( 
        urls.REDDIT_URL + "/api/v1/access_token",
        tools.url.formatAsPostForm( {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect }),
        null,
        {},
        appBasicAuthHeader
    );


}

export async function authenticateAsClient(appBasicAuthHeader ) : Promise<models.reddit.Token>
{
    return <models.reddit.Token> await api.reddit.postRequest( 
        urls.REDDIT_URL + "/api/v1/access_token",
        tools.url.formatAsPostForm( {
        grant_type: "client_credentials" }),
        null,
        {},
        appBasicAuthHeader
    );
}

export async function authenticatedWithRefreshToken(token : string, appBasicAuthHeader ) : Promise<models.reddit.Token>
{
    return <models.reddit.Token> await api.reddit.postRequest( 
        urls.REDDIT_URL + "/api/v1/access_token",
        tools.url.formatAsPostForm( {
            grant_type: "refresh_token",
            refresh_token: token
         }),
        null,
        {},
        appBasicAuthHeader
    );
}

export async function getUsername( auth : models.auth.RedditAuth )
{
    let result : { name : string } = < { name : string } > await api.reddit.getRequest(
    urls.REDDIT_OAUTH_API_URL + "/api/v1/me",
    {},
    auth);

    return result.name;
}
