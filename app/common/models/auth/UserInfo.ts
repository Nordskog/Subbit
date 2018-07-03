import IdToken from './IdToken'
import RedditAuth from './RedditAuth'

export default interface UserInfo
{
    id_token: IdToken;
    access_token : string;
    redditAuth : RedditAuth;
}
