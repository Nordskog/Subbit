export class Exception extends Error
{
    constructor( message : string)
    {
        super(message);
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
        this.code = code;
    }
}

//Usually expected behavior, doesn't need to be logged
export class CancelledException extends Exception
{
    constructor( message : string)
    {
        super(message)
    }
}

//Usually expected behavior, doesn't need to be logged
export class AuthorizationException extends Exception
{
    constructor( message : string)
    {
        super(message)
    }
}

//Should probably notify user of this
export class NetworkException extends Exception
{
    constructor( code : number, message : string)
    {
        super( (code == null ? "" :  code+": ") + message)
    }

    static async fromResponse( res : Response) : Promise<CancelledException>
    {
        let text : string = null;
        try
        {
            text = await res.json();
        }
        catch( err)
        {
            //No json body then
        }
        if (text == null)
            text = res.statusText;

        return new CancelledException( res.status+": "+text );
    }
}