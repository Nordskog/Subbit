import { isServer } from '~/common/tools/env';
import { Severity } from '~/common/log';
import { NetworkRequestDomain } from '~/common/models';

// The Object.setPrototypeOf stuff is an es5 requirement when extending base classes.
// https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

export class Exception extends Error
{
    public message : string;
    public name : string;

    // ...
    public prototype: any;
    public stack: string;

    constructor( message : string)
    {
        super(message);
        Object.setPrototypeOf(this, Exception.prototype);
        this.name = "Exception";
        this.message = message;
    }

    // Append a stack to this error's stack.
    // Necessary for nested promises
    public appendStack( appendStack : string)
    {
        this.stack = this.stack.concat(appendStack);
    }

    public toString()
    {
        return `${this.name}: ${this.message}`;
    }
}

// Usually expected behavior, doesn't need to be logged
export class RatelimitException extends Exception
{
    constructor( message : string)
    {
        super(message);
        Object.setPrototypeOf(this, RatelimitException.prototype);
        this.name = "RatelimitException";
    }

    public toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

// Usually expected behavior, doesn't need to be logged
export class EndpointException extends Exception
{
    // Optional http code, if error is likely to make it to an endpoint
    public code : number = null;

    // Optional severity level for backend logging.
    public severity : Severity = Severity.info;

    constructor( code : number, message : string, severity : Severity = Severity.info)
    {
        super(message);
        Object.setPrototypeOf(this, EndpointException.prototype);
        this.name = "EndpointException";
        this.code = code;
        this.severity = severity;
    }

    public toString()
    {
        if (this.code == null)
            return `${this.name}: ${this.message}`;
        else
            return `${this.name} ${this.code}: ${this.message}`;
    }
}

// Usually expected behavior, doesn't need to be logged
export class CancelledException extends Exception
{
    constructor( message : string)
    {
        super(message);
        Object.setPrototypeOf(this, CancelledException.prototype);
        this.name = "CancelledException";
    }

    public toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

// For all other generic stuff we want logged, but not popped in user's face
export class LogOnlyException extends Exception
{
    public wrappedError : Error;

    constructor( message : string, error : Error)
    {
        super(message);
        Object.setPrototypeOf(this, LogOnlyException.prototype);
        this.wrappedError = error;
        this.name = "LogOnlyException";
    }

    public toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

export class SocketException extends Exception
{
    constructor( message : string)
    {
        super(message);
        Object.setPrototypeOf(this, SocketException.prototype);
        this.name = "SocketException";
    }

    public toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

// Usually expected behavior, doesn't need to be logged
export class AuthorizationException extends Exception
{
    constructor( message : string)
    {
        super(message);
        Object.setPrototypeOf(this, AuthorizationException.prototype);
        this.name = "AuthorizationException";
    }

    public toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

// Access token has expired or otherwise invalidated.
// Corresponds to http code 401, which should trigger a logout.
export class AuthorizationInvalidException extends Exception
{
    constructor( message : string)
    {
        super(message);
        Object.setPrototypeOf(this, AuthorizationInvalidException.prototype);
        this.name = "AuthorizationInvalidException";
    }

    public toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

// Should probably notify user of this
export class NetworkException extends Exception
{
    public url : string;
    public code: number;
    public res: Response;
    public source?: NetworkRequestDomain;

    constructor( code : number, message : string, url : string, res? : Response, source?: NetworkRequestDomain)
    {
        super( message );
        Object.setPrototypeOf(this, NetworkException.prototype);
        this.name = "NetworkException";
        this.url = url;
        this.code = code;
        this.res = res;
        this.source = source;
    }

    public static async fromResponse( res : Response, source?: NetworkRequestDomain) : Promise<NetworkException>
    {
        let text : string = null;
        try
        {
            let resBody : any = await res.json();

            // It's fairly common for servers to return a json object with a message field
            if ( resBody.message != null )
            {
                if (resBody.reason != null)
                {
                    text = `${resBody.message}: ${resBody.reason}`;
                }
                else
                {
                    text = resBody.message;
                }
            }
            else
            {
                // If not, the body may be a primitive
                if (resBody !== Object(resBody))
                {
                    text = resBody;
                }
                else
                {
                    // Otherwise just stringify the thing
                    // and pray we don't end up with Object object
                    text = JSON.stringify(resBody);
                }
  
            }
        }
        catch( err)
        {
            // No json body then
        }
        if (text == null)
            text = res.statusText;

        return new NetworkException( res.status, text, res.url, null, source);
    }

    public toString()
    {
        let str; 

        if (this.code == null)
            str = `${this.name}: ${this.message}`;
        else
            str = `${this.name} ${this.code}: ${this.message}`;

        if (this.url != null)
            str = `${str} at ${this.url}`;

        return str;
    }

    public toSimpleString()
    {
        if (this.code == null)
            return `${this.name}: ${this.message}`;
        else
            return `${this.name} ${this.code}: ${this.message}`;
    }

}

export function appendStack( err : any, stack : string)
{
    if (err.stack != null)
        err.stack = err.stack.concat(stack);
}
