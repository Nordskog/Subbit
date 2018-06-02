import * as config from './config'
import * as jwt from 'jsonwebtoken';

import * as Wetland from 'wetland';


import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';
import * as models from '~/common/models';
import { AuthorizationException } from '~/common/exceptions';
import { scopes } from '~/backend/authentication/generation';


export async function getAuthorizedUser (manager : Wetland.Scope, access_token_raw, options? : any, scope?: scopes, )
{
    if (access_token_raw == null)
    {
        throw new AuthorizationException("No user token provided");
    }

    let decodedToken = await decodeToken(access_token_raw);

    let user : Entities.User = await getUserFromToken(manager, decodedToken, options);

    if (scope != null)
    {
        if (!checkScope(decodedToken.scopes,scope) )
        {
            throw new AuthorizationException("Token does not provide access to scope: "+scope);
        }
    }
    
    return user;
}

export async function decodeToken(access_token_raw)
{
    let decodedToken = null;
    try
    {
        decodedToken = jwt.verify(access_token_raw, config.secret)
    }
    catch(err)
    {
        console.log(err);
        throw new AuthorizationException("Token could not be verified");
    }

    return decodedToken;
}


async function getUserFromToken(manager : Wetland.Scope, decodedToken, options : any) 
{
    let username = decodedToken.sub;
    let user : Entities.User = null;
    options = options != null ? options : {};

    
    user = await manager.getRepository(Entities.User).findOne({ username: username }, { populate: "auth", ...options});

    if (user == null)
    {
        throw new AuthorizationException("Could not find user associated with token");
    }
    
    return user;
}

function checkScope(scope: scopes, scopes: string) {
    if (scope)  //If no scope specified then ignore
    {
        let scopesArray: string[] = scopes.split(' ');
        for (let singleScope of scopesArray) {
            if (singleScope === scope) {
                return true;
            }
        };

        return false;
    }

    return true;


}

export function checkuser(sub: string, user: Entities.User): boolean {
    return user.username == sub;

}
