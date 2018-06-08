import * as ReduxTypes from './types';
import { Exception, CancelledException } from "~/common/exceptions";
import { toast, ToastType } from "~/client/toast";

export function WrapWithHandler( action : (dispatch : ReduxTypes.Dispatch, getState : ReduxTypes.GetState ) => (any | Promise<any>) )
{
    return async (dispatch : ReduxTypes.Dispatch, getState : ReduxTypes.GetState ) => 
    {
        try
        {
            await action(dispatch,getState);
        }
        catch ( err )
        {
            handleError(err);
        }
    }
}

export function handleError( err : Error ) : boolean
{
    if (err instanceof CancelledException)
    {
        //We always do this on purpose
    }
    //Display these
    else if ( err instanceof Exception )
    {
        toast( ToastType.ERROR, 10000, err.message );
    }

    //Rethrow show it shows up in console
    throw err;
}