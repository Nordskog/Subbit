import * as ReduxTypes from './types';
import { Exception, CancelledException, NetworkException, AuthorizationInvalidException } from "~/common/exceptions";
import { toast, ToastType } from "~/client/toast";
import * as actions from '~/client/actions'

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
            handleError(dispatch, err);
        }
    }
}

export function handleError(dispatch : ReduxTypes.Dispatch, err : Error )
{
    if (err instanceof CancelledException)
    {
        //We always do this on purpose
    }
    //Display these
    else if (err instanceof AuthorizationInvalidException)
    {
        //Simplify for user consumption
        toast( ToastType.ERROR, 10000, err.message);

        //This error means the access tokem is invalid
        //and the user should be logged out.
        dispatch(actions.authentication.logoutUserAction());
    }
    else if (err instanceof NetworkException)
    {
        if (err.code == 401)
        {
            //401 from the server means access token invalidate, force a logout.
            dispatch(actions.authentication.logoutUserAction());

            //Simplify for user consumption
            toast( ToastType.ERROR, 10000, err.message);
        }
        else
        {
            //Simplify for user consumption
            toast( ToastType.ERROR, 10000, err.toSimpleString());
        }
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