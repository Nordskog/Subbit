import * as models from '~/common/models'
import * as jwt from 'jsonwebtoken';

export function decodeTokensToUserInfo(id_token : string, access_token : string, redditAuth : models.auth.RedditAuth) : models.auth.UserInfo
{
    let userinfo : models.auth.UserInfo = {
        id_token: jwt.decode(id_token) as models.auth.IdToken,
        access_token: access_token,
        redditAuth: redditAuth,
    };

    userinfo.id_token.raw = id_token;

    return userinfo;
}