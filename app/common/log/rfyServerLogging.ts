import * as Winston from 'winston';

const logger = Winston.createLogger({
    format: Winston.format.json(),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      //new Winston.transports.File({ filename: 'error.log', level: 'error' }),
      //new Winston.transports.File({ filename: 'combined.log' })
      new Winston.transports.Console( { format: Winston.format.simple() } )
    ]
  });

  export function I( message : any)
  {
    logger.info(message);
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