import * as Winston from 'winston';
import { Severity } from './models';



const LogLevels = {
  levels: {
    error: 0,
    warning: 1,
    access: 2,
    info: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warning: 'orange',
    access: 'green',
    info: 'blue',
    debug: 'cyan'
  }
};

const logger = Winston.createLogger({
  levels: LogLevels.levels,
  format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    //new Winston.transports.File({ filename: 'error.log', level: 'error' }),
    //new Winston.transports.File({ filename: 'combined.log' })
    new Winston.transports.Console( { format: Winston.format.combine( Winston.format.json(), Winston.format.timestamp() ) } )
  ]
});

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