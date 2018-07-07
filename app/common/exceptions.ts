const isNode = require('detect-node');

export class Exception extends Error
{
    message : string;
    name : string;

    // ...
    prototype: any;
    stack: string;

    constructor( message : string)
    {
        super(message);
        this.name = "Exception";
        this.message = message;

        //The corrent Error.captureStackTrace() doesn't work in firefox these days.
        //This at least gives us something to work with.
        //Just extending error we don't seem to actually get a stack trace.
        if (isNode)
        {
            //Make sure the stack trace is actually correct.
            Error.captureStackTrace(this, this.constructor );
        }
        else 
        {
            this.stack = ( new Error(message) ).stack; 
        }
    }

    //Append a stack to this error's stack.
    //Necessary for nested promises
    appendStack( appendStack : string)
    {
        console.log("appending stack:",appendStack);
        this.stack = this.stack.concat(appendStack);
    }

    toString()
    {
        return `${this.name}: ${this.message}`;
    }
}

//Usually expected behavior, doesn't need to be logged
export class EndpointException extends Exception
{
    //Optional http code, if error is likely to make it to an endpoint
    code : number = null;

    constructor( code : number, message : string)
    {
        super(message);
        this.name = "EndpointException";
        this.code = code;
    }

    toString()
    {
        if (this.code == null)
            return `${this.name}: ${this.message}`;
        else
            return `${this.name} ${this.code}: ${this.message}`;
    }
}

//Usually expected behavior, doesn't need to be logged
export class CancelledException extends Exception
{
    constructor( message : string)
    {
        super(message)
        this.name = "CancelledException";
    }

    toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

export class SocketException extends Exception
{
    constructor( message : string)
    {
        super(message)
        this.name = "SocketException";
    }

    toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

//Usually expected behavior, doesn't need to be logged
export class AuthorizationException extends Exception
{
    constructor( message : string)
    {
        super(message)
        this.name = "AuthorizationException";
    }

    toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

//Access token has expired or otherwise invalidated.
//Corresponds to http code 401, which should trigger a logout.
export class AuthorizationInvalidException extends Exception
{
    constructor( message : string)
    {
        super(message)
        this.name = "AuthorizationInvalidException";
    }

    toString()
    {
         return `${this.name}: ${this.message}`;
    }
}

//Should probably notify user of this
export class NetworkException extends Exception
{
    url : string;
    code: number;
    res: Response;

    constructor( code : number, message : string, url : string, res? : Response)
    {
        super( message );
        this.name = "NetworkException";
        this.url = url;
        this.code = code;
        this.res = res;
    }

    static async fromResponse( res : Response) : Promise<NetworkException>
    {
        let text : string = null;
        try
        {
            let resBody : any = await res.json();

            //It's fairly common for servers to return a json object with a message field
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
                //If not, the body may be a primitive
                if (resBody !== Object(resBody))
                {
                    text = resBody;
                }
                else
                {
                    //Otherwise just stringify the thing
                    //and pray we don't end up with Object object
                    text = JSON.stringify(resBody);
                }
  
            }
        }
        catch( err)
        {
            //No json body then
        }
        if (text == null)
            text = res.statusText;

        return new NetworkException( res.status, text, res.url);
    }

    toString()
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

    toSimpleString()
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