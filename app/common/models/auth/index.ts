export {default as AuthState} from './AuthState';
export {default as IdToken} from './IdToken';
export {default as RedditAuth} from './RedditAuth';
export {default as UserInfo} from './UserInfo';
export {default as AccessToken} from './AccessToken'

export enum LoginType
{
    PERMANENT = "permanent",
    SESSION = "session"
}