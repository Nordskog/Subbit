import IdToken from './IdToken';
import RedditAuth from './RedditAuth';

export default interface UserInfo
{
    id_token: IdToken;
    access_token : string;
    reddit_auth : RedditAuth;           // Main auth
    reddit_auth_additional : RedditAuth;   // Temp for messaging UpdateMeBot
}
