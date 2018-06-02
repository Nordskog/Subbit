export class Exception extends Error
{
    constructor( message : string)
    {
        super(message);
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

//Should probably notify user of this
export class NetworkException extends Exception
{
    constructor( code : number, message : string)
    {
        super(code+": "+message)
    }

    static fromResponse( res : Response) : CancelledException
    {
        let text : string = res.statusText;
        if (res.body != null)
            text = JSON.stringify(res.body);
        return new CancelledException( res.status+": "+text );
    }
}