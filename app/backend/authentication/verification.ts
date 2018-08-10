
import * as jwt from 'jsonwebtoken';

import * as Wetland from 'wetland';

import serverConfig from 'root/server_config'
import * as Entities from '~/backend/entity';
import { AuthorizationException, AuthorizationInvalidException } from '~/common/exceptions';
import { Scope } from '~/backend/authentication/generation';
import { AccessToken } from '~/common/models/auth';
import * as Log from '~/common/log';

//Convenience function. Only use this after you have already validated the token.
export async function getDecodedTokenWithoutVerifying( access_token_raw : string ) : Promise<AccessToken>
{
    if (access_token_raw == null)
    {
        throw new AuthorizationInvalidException("No user token provided");
    }

    let decodedToken : AccessToken = await decodeToken(access_token_raw);

    return decodedToken;
}

export async function getAuthorizedUser (manager : Wetland.Scope, access_token_raw : string, options? : any, scope?: Scope, )
{
    if (access_token_raw == null)
    {
        throw new AuthorizationInvalidException("No user token provided");
    }

    let decodedToken : AccessToken = await decodeToken(access_token_raw);

    let user : Entities.User = await getUserFromToken(manager, decodedToken, options);

    if (user.generation !== decodedToken.generation)
    {
        throw new AuthorizationInvalidException("Token generation has been invalidated");
    }

    if (scope != null)
    {
        //Normal scopes
        if (!checkScope(scope, decodedToken.scope) )
        {
            throw new AuthorizationException("Token does not provide access to scope: "+scope);
        }

        //Admin/stats scopes
        if (!confirmSpecialScope(scope, user))
        {
            throw new AuthorizationException("Token claimed access to scope not available to user: "+scope);
        }
    }
    
    return user;
}

export async function getAuthenticatedScopes( manager : Wetland.Scope, access_token_raw : string )
{
    if (access_token_raw == null)
    {
        throw new AuthorizationException("No user token provided");
    }

    let decodedToken : AccessToken = await decodeToken(access_token_raw);
    let user : Entities.User = await getUserFromToken(manager, decodedToken, {});

    if (user.generation !== decodedToken.generation)
    {
        throw new AuthorizationInvalidException("Token generation has been invalidated");
    }

    //Base scope from 
    let scopes : Scope[] = decodedToken.scope.split(' ') as Scope[];

    //Confirm special scopes
    for (let scope of scopes)
    {
        if ( !confirmSpecialScope(scope, user))
        {
            throw new AuthorizationException("Token claimed access to scope not available to user: "+scope);
        }
    }

    //If no-throw we are all good
    return scopes;
}

async function decodeToken(access_token_raw : string) : Promise<AccessToken>
{
    let decodedToken : AccessToken = null;
    try
    {
        decodedToken = jwt.verify(access_token_raw, serverConfig.token.publicKey) as AccessToken
    }
    catch(err)
    {
        if ( err instanceof jwt.TokenExpiredError)
        {
            //This is expected
        }
        else
        {
            //Anything else is not expected and may suggest foul play
            Log.E(err);
        }
    
        throw new AuthorizationInvalidException( `Token could not be verified because of ${err.name}`);
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

function confirmSpecialScope(requiredScope: Scope, user : Entities.User)
{
    if (requiredScope == Scope.ADMIN)
    {
        return user.admin_access;
    }
    else if (requiredScope == Scope.STATS)
    {
        return user.stats_access;
    }

    return true;
}

function checkScope( requiredScope: Scope, permittedScopes: string) {
    
    if ( requiredScope != null)  //If no scope specified then ignore
    {
        let scopesArray: string[] = permittedScopes.split(' ');
        for (let singleScope of scopesArray) {
            if (singleScope ===  requiredScope) {
                return true;
            }
        };

        return false;
    }

    return true;
}

function checkuser(sub: string, user: Entities.User): boolean {
    return user.username == sub;

}
