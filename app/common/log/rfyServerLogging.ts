// tslint:disable:ban-types

import { Severity } from './models';
import LoggerInterface from './LoggerInterface';
import { WinstonLogger } from '~/common/log/WinstonLogger';
import { SlaveLogger } from '~/common/log/SlaveLogger';

let logger : LoggerInterface = null;

export function I( message : any, meta : Object = {})
{
  logger.I(message,meta);
}

export function A( message : any, user : string, ip : string,  meta : Object = {})
{
  logger.A(message,user,ip,meta);
}

export function E( message : any, meta : Object = {})
{
  logger.E(message,meta);
}

export function D( message : any, meta : Object = {})
{
  logger.D(message,meta);
}

export function W( message : any, meta : Object = {})
{
  logger.W(message,meta);
}

export function L( severity : Severity, message : any, meta : Object = {})
{
  logger.L(severity, message, meta);
}

export function init( isMaster : boolean = false, isDev : boolean = false)
{
  if (isMaster)
  {
    logger = new WinstonLogger( isDev );
  }
  else
  {
    logger = new SlaveLogger();
  }
}

export function setExitOnUncaughtException( exitOnError : boolean )
{
  if (logger != null)
  {
    logger.setExitOnUncaughtException(exitOnError);
  }
}
