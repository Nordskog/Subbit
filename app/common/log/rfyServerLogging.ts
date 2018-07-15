import * as Winston from 'winston';
import { Severity } from './models';
import serverConfig from 'root/server_config';
import * as Path from 'path';
import * as FS from 'fs';



const LogLevels = {
  levels: {
    error: 0,
    warning: 1,
    info: 2,
    access: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warning: 'orange',
    access: 'green',
    info: 'blue',
    debug: 'cyan'
  }
};

///////////////////////////////////////////////////
// Convenience functions for filtering log output
///////////////////////////////////////////////////

function filterInclude(level) 
{
  return Winston.format( (info) =>
  {
    if (info.level === level)
      return info;
    return false;
  })();
}

function filterExclude(level) 
{
  return Winston.format( (info) =>
  {
    if (info.level !== level)
      return info;
    return false;
  })();
}

let logger : Winston.Logger = null;

export function init()
{
  logger = Winston.createLogger({
    levels: LogLevels.levels,
    format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ),
    transports: [
        //All added dynamically.
    ]
  });

  if( process.env.NODE_ENV === 'development' )
  {
    initFileLogs();
    initConsoleLog();
  }
  else
  {
    //Init file logs, fallback to console if not configured.
    if ( !initFileLogs() )
    {
      initConsoleLog();
    }
  }

}

function createLogFolder( folder : string)
{
  if (folder != null)
  {
    if ( !FS.existsSync( serverConfig.logging.logDirectoryPath ) ) 
    {
      // Create the directory if it does not exist
      FS.mkdirSync( serverConfig.logging.logDirectoryPath );
    }
  }
}

function initFileLogs() : boolean
{
  if (serverConfig.logging.logDirectoryPath != null)
  {
    createLogFolder( serverConfig.logging.logDirectoryPath );

    logger.add( new Winston.transports.File( 
    {  
      level:Severity.access,
      format: filterInclude(Severity.access),
      filename: Path.join( serverConfig.logging.logDirectoryPath, 'access.log') 
    }));
  
  
    logger.add( new Winston.transports.File( 
    {  
      level:Severity.info,
      filename: Path.join( serverConfig.logging.logDirectoryPath, 'log.log') 
    }));

    return true;
  }
  
  return false;
}

function initConsoleLog()
{
  logger.add( new Winston.transports.Console( { level: Severity.debug, format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ) } ) );
}

//In addition to the existing "level" and "message", the following metadata may be included:
//ip
//user (username)
//payload

export function I( message : any, meta : Object = {})
{
  logger.info(message, meta);
}

export function A( message : any, user : string, ip : string,  meta : Object = {})
{
  meta = {  ... meta, 
            user: user, 
            ip: ip
        } as any;
  logger.log(Severity.access, message, meta);
}

export function E( message : any, meta : Object = {})
{
  logger.error(message, meta);
}

export function D( message : any, meta : Object = {})
{
  logger.debug(message, meta);
}

export function W( message : any, meta : Object = {})
{
  logger.warning(message, meta);
}

export function L( severity : Severity, message : any, meta : Object = {})
{
  logger.log( severity, message, meta);
}