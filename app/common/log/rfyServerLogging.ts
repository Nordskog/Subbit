import * as Winston from 'winston';

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
    format: Winston.format.combine(  Winston.format.simple(), Winston.format.timestamp() ),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      //new Winston.transports.File({ filename: 'error.log', level: 'error' }),
      //new Winston.transports.File({ filename: 'combined.log' })
      new Winston.transports.Console( {  } )
    ]
  });

  export function I( message : any)
  {
    logger.info(message);
  }

  export function A( message : any)
  {
    logger.log('access', message);
  }

  export function E( message : any)
  {
    logger.error(message);
  }

  export function D( message : any)
  {
    logger.debug(message);
  }

  export function W( message : any)
  {
    logger.warning(message);
  }