import * as models from '~/common/models'
import * as config from '~/backend//authentication/config'
import * as jwt from 'jsonwebtoken';

export function decodUserInfoCookieToClient(userJson) : models.auth.UserInfo
{
    let userinfo = undefined;
    jwt.verify(userJson.id_token, config.secret, (error, id_token) => {
        if (error) {
            console.log("Failed to verify existing userinfo: ", error);
        }
        else {
            jwt.verify(userJson.access_token, config.secret, (error, access_token) => {
                if (error) {
                    console.log("Failed to verify existing userinfo: ", error);
                    return undefined;
                }
                else {
                    userinfo = {
                        id_token: id_token,
                        access_token: userJson.access_token,
                        redditAuth: userJson.redditAuth
                    };
                }
            });
        }

    });

    return userinfo;
}