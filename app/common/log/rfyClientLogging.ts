// tslint:disable:ban-types
import { Severity } from './models';

export function I( message : any, meta : Object = {})
{
  console.log(message, meta);
}

export function A( message : any, user : string, ip : string,  meta : Object = {})
{
  meta = {  ... meta, 
            user: user, 
            ip: ip
        } as any;
  console.log( message, meta);
}

export function E( message : any, meta : Object = {})
{
  console.error(message, meta);
}

export function D( message : any, meta : Object = {})
{
  console.debug(message, meta);
}

export function W( message : any, meta : Object = {})
{
  console.warn(message, meta);
}

export function L( severity : Severity, message : any, meta : Object = {})
{
  console.log( severity, message, meta);
}

export function init()
{
  // Do nothing on client.
}

export function setExitOnUncaughtException( exitOnError : boolean )
{
  // Do nothing on client
}
