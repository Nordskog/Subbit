import * as models from '~/common/models'

//jwt code takes up too much space. Will past contents directly,
//since we only use it to display ui elements anyway
//import { decode } from 'jsonwebtoken';

/*
export function decodeTokensToUserInfo(id_token : string, access_token : string, redditAuth : models.auth.RedditAuth) : models.auth.UserInfo
{
   let userinfo : models.auth.UserInfo = {
    id_token: null,
    access_token: access_token,
    redditAuth: redditAuth,
};

userinfo.id_token.raw = id_token;

    return userinfo;
}
*/


export function combineUserInfo(id_token : models.auth.IdToken, access_token : string, redditAuth : models.auth.RedditAuth) : models.auth.UserInfo
{
   let userinfo : models.auth.UserInfo = {
    id_token: id_token,
    access_token: access_token,
    redditAuth: redditAuth,
   };

    return userinfo;
};

