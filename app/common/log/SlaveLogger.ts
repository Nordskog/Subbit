import { Severity } from './models';
import LoggerInterface from './LoggerInterface'
import { Action } from '~/common/models';
import * as clusterActions from '~/backend/cluster/actionTypes'
import errToJson from 'error-to-json';

export class SlaveLogger implements LoggerInterface
{
  
    //Sends log to master 
    static log( severity : Severity, msg : any, meta : object )
    {
      if (msg instanceof Error)
      {
        msg = errToJson(msg);
      }

      let action : Action<clusterActions.log.LOG> = {
        type: clusterActions.log.LOG,
        payload: 
        {
          severity: severity,
          msg: msg, 
          meta: meta
        }
      }

        process.send( action );
    }

    ////////////////////////////
    // Interface implementation
    ////////////////////////////
  
    I( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.info, message, meta);
    }
    
    A( message : any, user : string, ip : string,  meta : Object = {})
    {
      meta = {  ... meta, 
                user: user, 
                ip: ip
            } as any;
      SlaveLogger.log(Severity.access, message, meta);
    }
    
    E( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.error,message, meta);
    }
    
    D( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.debug,message, meta);
    }
    
    W( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.warning, message, meta);
    }
    
    L( severity : Severity, message : any, meta : Object = {})
    {
      SlaveLogger.log( severity, message, meta);
    }

    setExitOnUncaughtException( exitOnError : boolean )
    {
      //Does nothing
    }

}