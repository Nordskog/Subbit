import { models, urls, api, tools } from "~/common";

import { Thing, Message, Listing } from '~/common/models/reddit';


export async function getPrivateMessagesInbox( count : number, additionalAuth : models.auth.RedditAuth )
{
    let result = < Thing< Listing<Message> > > await api.reddit.getRequest(
    urls.REDDIT_OAUTH_API_URL + "/message/inbox",
    {
        limit: count
    },
    additionalAuth);

    return result;
}

export async function getPrivateMessagesOutbox( count : number, additionalAuth : models.auth.RedditAuth )
{
    let result = < Thing< Listing<Message> > > await api.reddit.getRequest(
    urls.REDDIT_OAUTH_API_URL + "/message/sent",
    {
        limit: count
    },
    additionalAuth);

    return result;
}

export async function sendPrivateMessage( to: string, subject: string, text: string, additionalAuth : models.auth.RedditAuth ) : Promise<boolean>
{
    let result = await api.reddit.postRequest(
    urls.REDDIT_OAUTH_API_URL + "/api/compose",
    tools.url.formatAsPostForm
    ({
        to: to,
        subject: subject,
        text: text,
        api_type: "json"
    }),
    additionalAuth,
    {},
    {"Content-Type": "application/x-www-form-urlencoded"}   // Other post requests (auth at this point), don't require this.
    );

    // Returns 200 even on failure.
    // 

    return true;
}
