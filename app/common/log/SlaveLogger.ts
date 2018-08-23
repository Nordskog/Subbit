// tslint:disable:ban-types

import { Severity } from './models';
import LoggerInterface from './LoggerInterface';
import { Action } from '~/common/models';
import * as clusterActions from '~/backend/cluster/actionTypes';
import errToJson from 'error-to-json';

export class SlaveLogger implements LoggerInterface
{
  
    // Sends log to master 
    public static log( severity : Severity, msg : any, meta : object )
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
      };

        process.send( action );
    }

    ////////////////////////////
    // Interface implementation
    ////////////////////////////
  
    public I( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.info, message, meta);
    }
    
    public A( message : any, user : string, ip : string,  meta : Object = {})
    {
      meta = {  ... meta, 
                user: user, 
                ip: ip
            } as any;
      SlaveLogger.log(Severity.access, message, meta);
    }
    
    public E( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.error,message, meta);
    }
    
    public D( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.debug,message, meta);
    }
    
    public W( message : any, meta : Object = {})
    {
      SlaveLogger.log(Severity.warning, message, meta);
    }
    
    public L( severity : Severity, message : any, meta : Object = {})
    {
      SlaveLogger.log( severity, message, meta);
    }

    public setExitOnUncaughtException( exitOnError : boolean )
    {
      // Does nothing
    }

}
