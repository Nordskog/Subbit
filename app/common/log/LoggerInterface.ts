// tslint:disable:ban-types

import { Severity } from './models';
export default interface LoggerInterface
{
    I( message : any, meta : Object ) : void;
    A( message : any, user : string, ip : string,  meta : Object) : void;
    E( message : any, meta : Object) : void;
    D( message : any, meta : Object) : void;
    W( message : any, meta : Object) : void;
    L( severity : Severity, message : any, meta : Object) : void;

    setExitOnUncaughtException( exitOnError : boolean ) : void;

}
