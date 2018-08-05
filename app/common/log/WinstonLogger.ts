import * as Winston from 'winston';
import WinstonDailyRotateFile from 'winston-daily-rotate-file';
import { Severity } from './models';
import serverConfig from 'root/server_config';
import * as Path from 'path';
import * as FS from 'fs';
import LoggerInterface from './LoggerInterface'
import errToJson from 'error-to-json';
import { format } from 'url';

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

export class WinstonLogger implements LoggerInterface
{
    logger : Winston.Logger = null;

    constructor( isDev : boolean = false)
    {
        this.logger = Winston.createLogger({
            levels: LogLevels.levels,
            format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp( { format: () => Date.now() / 1000 } )),
            transports: [
                //All added dynamically.
            ]
          });
        
          if( isDev )
          {
            this.initFileLogs();
            this.initConsoleLog();
          }
          
          else
          {
            //Init file logs, fallback to console if not configured.
            if ( !this.initFileLogs() )
            {
              this.initConsoleLog();
            }
          }
          
    }

      ///////////////////////////////////////////////////
      // Convenience functions for filtering log output
      ///////////////////////////////////////////////////
      
    static filterInclude(level) 
    {
        return Winston.format( (info) =>
        {
            if (info.level === level)
            return info;
            return false;
        })();
    }
      
    static filterExclude(level) 
    {
        return Winston.format( (info) =>
        {
            if (info.level !== level)
            return info;
            return false;
        })();
    }
      
    static createLogFolder( folder : string)
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
      
    initFileLogs() : boolean
    {
        if (serverConfig.logging.logDirectoryPath != null)
        {
            WinstonLogger.createLogFolder( serverConfig.logging.logDirectoryPath );
        
            this.logger.add( new WinstonDailyRotateFile( 
            { 
                level:Severity.access,
                format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp(), WinstonLogger.filterInclude(Severity.access) ),
                filename: Path.join( serverConfig.logging.logDirectoryPath, 'access_%DATE%.log'),
                datePattern: 'YYYY-MM-DD',  //1 log file per day
                maxSize: '20m',
                maxFiles: '14d'
            }));
    
        
            this.logger.add( new WinstonDailyRotateFile( 
            {  
                level:Severity.info,
                format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ),
                filename: Path.join( serverConfig.logging.logDirectoryPath, 'log_%DATE%.log'),
                datePattern: 'YYYY-MM-DD',  //1 log file per day
                maxSize: '20m',
                maxFiles: '14d'
            }));

            this.logger.add( new WinstonDailyRotateFile( 
            {  
                handleExceptions: true,
                level:Severity.warning,
                format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ),
                filename: Path.join( serverConfig.logging.logDirectoryPath, 'error_%DATE%.log'),
                datePattern: 'YYYY-MM-DD',  //1 log file per day
                maxSize: '20m',
                maxFiles: '14d'
            }));
            
                return true;
        }
        
        return false;
    }
      
    initConsoleLog()
    {
        this.logger.add( 
            new Winston.transports.Console( 
                { 
                    handleExceptions: true,
                    level: Severity.debug, 
                    format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ) 
                }
            ));
    }

    ////////////////////////////
    // Interface implementation
    ////////////////////////////

    I( message : any, meta : Object = {})
    {
        this.L(Severity.info, message, meta);
    }

    A( message : any, user : string, ip : string,  meta : Object = {})
    {
        meta = {  ... meta, 
                user: user, 
                ip: ip
            } as any;

            this.L(Severity.access, message, meta);
    }

    E( message : any, meta : Object = {})
    {
        this.L(Severity.error, message, meta);
    }

    D( message : any, meta : Object = {})
    {
        this.L(Severity.debug, message, meta);
    }

    W( message : any, meta : Object = {})
    {
        this.L(Severity.warning, message, meta);
    }

    L( severity : Severity, message : any, meta : Object = {})
    {
        if (message instanceof Error)
        {
          message = errToJson(message);
        }

        this.logger.log( severity, message, meta);
    }

    setExitOnUncaughtException( exitOnError : boolean )
    {
        if (this.logger != null)
        {
            this.logger.exitOnError = exitOnError;
        }
    }
}