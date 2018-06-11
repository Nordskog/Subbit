import * as ReduxTypes from './types';
import { Exception, CancelledException, NetworkException } from "~/common/exceptions";
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

export function handleError( err : Error )
{
    if (err instanceof CancelledException)
    {
        //We always do this on purpose
    }
    //Display these
    else if (err instanceof NetworkException)
    {
        //Simplify for user consumption
        toast( ToastType.ERROR, 10000, err.toSimpleString());
    }
    else if ( err instanceof Exception )
    {
        toast( ToastType.ERROR, 10000, err.message );
    }

    if ( err instanceof Exception)
    {
        //Also log any of our own, since throwing them here just makes them vanish into the void.
        console.error( err.toString() );
    }
    else
    {
        throw err;
    }


}