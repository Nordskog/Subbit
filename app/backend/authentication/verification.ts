import * as config from './config'
import * as jwt from 'jsonwebtoken';

import * as Wetland from 'wetland';


import * as RFY from '~/backend/rfy';
import * as Entities from '~/backend/entity';
import * as models from '~/common/models';



export async function authorizeUser(access_token_raw, user? : Entities.User, scope?: string) : Promise<boolean>
{
    let decodedToken = await decodeToken(access_token_raw);
    if (decodedToken == null)
        return false;

    if (user != null)
    {
        if ( !checkuser(decodedToken.sub, user) )
        return false;
    }

    if (scope != null)
    {
        if ( !checkScope(scope, decodedToken.scopes) )
            return false;
    }

    return true;
}


export async function getUserIfAuthorized (manager : Wetland.Scope, access_token_raw, options? : any, scope?: string, )
{
    if (access_token_raw == null)
    {
        console.log("No access token provided");
        return null;
    }

    let decodedToken = await decodeToken(access_token_raw);
    if (decodedToken == null)
        return null;

    let user : Entities.User = await getUserFromToken(manager, decodedToken, options);
    if (user != null)
    {
        if (scope != null)
        {
            if (!checkScope(decodedToken.scopes,scope) )
                return null;
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
        console.log("Error: Access token invalid: ",err);
    }

    return decodedToken;
}

async function getUser(manager : Wetland.Scope, username : string, options? : any )
{
    let user : Entities.User = null;
    options = options != null ? options : {};
    try
    {
        user = await manager.getRepository(Entities.User).findOne({ username: username }, { populate: "auth", ...options});
    }
    catch (err)
    {
        console.log("Auth error: ",err);
    }

    return user;
}

async function getUserFromToken(manager : Wetland.Scope, decodedToken, options : any) 
{
    let username = decodedToken.sub;
    let user : Entities.User = null;
    options = options != null ? options : {};
    try
    {
        user = await manager.getRepository(Entities.User).findOne({ username: username }, { populate: "auth", ...options});
    }
    catch (err)
    {
        console.log("Auth error: ",err);
    }

    return user;
}

function checkScope(scope: string, scopes: string) {
    if (scope)  //If no scope specified then ignore
    {
        let scopesArray: string[] = scopes.split(' ');
        for (let singleScope of scopesArray) {
            if (singleScope === scope) {
                return true;
            }
    
        };

        console.log("Failed to find scope ",scope);

        return false;
    }

    return true;


}

export function checkuser(sub: string, user: Entities.User): boolean {
    return user.username == sub;

}
