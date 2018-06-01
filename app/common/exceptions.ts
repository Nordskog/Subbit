export class RfyException extends Error
{
    type : ExceptionType;
    constructor( message : string, type : ExceptionType)
    {
        super(message);
    }
}

export enum ExceptionType
{
    DEFAULT,  CANCELLED
}

export class CancelledException extends RfyException
{
    constructor( message : string)
    {
        super(message, ExceptionType.CANCELLED)
    }
}