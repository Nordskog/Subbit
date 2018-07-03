import * as WebSocket from 'ws'; 
import { Scope } from '~/backend/authentication/generation';
import { AuthorizationException } from '~/common/exceptions';

const authenticatedSockets : Map<WebSocket, AuthenticatedSocket> = new Map<WebSocket, AuthenticatedSocket>();

class AuthenticatedSocket
{
    ws : WebSocket;
    scopes : Set<Scope>;

    constructor( ws : WebSocket, ...scopes : Scope[])
    {
        this.ws = ws;
        this.scopes = new Set<Scope>();
        for ( let scope of scopes)
            this.scopes.add(scope);
    }

    checkScopes( scope : Scope ) : boolean
    {
        return this.scopes.has(scope);
    }

    addScopes( ...scopes : Scope[] )
    {
        for ( let scope of scopes)
            this.scopes.add(scope);
    }
}

export function add( ws : WebSocket, ...scopes : Scope[])
{
    let aws : AuthenticatedSocket = authenticatedSockets.get(ws);
    if (aws == null)
    {
        aws = new AuthenticatedSocket(ws, ...scopes);
        authenticatedSockets.set(ws, aws);
    }
    else
    {
        aws.addScopes(...scopes);
    }

    
}

export function remove( ws : WebSocket)
{
    authenticatedSockets.delete(ws);
}

export function checkAccess( ws : WebSocket, scope : Scope)
{
    let aws : AuthenticatedSocket = authenticatedSockets.get(ws);
    if (aws == null)
    {
        return false;
    }

    return aws.checkScopes(scope);
}

export function throwCheckAccess(  ws : WebSocket, scope : Scope) 
{
    if ( !checkAccess(ws, scope))
    {
        throw new AuthorizationException("Socket is not authorized for scope "+scope);
    }
}