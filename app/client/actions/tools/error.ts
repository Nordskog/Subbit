import * as ReduxTypes from './types';
import { Exception, CancelledException, NetworkException, AuthorizationInvalidException, LogOnlyException } from "~/common/exceptions";
import { toast, ToastType } from "~/client/toast";
import * as actions from '~/client/actions';
import * as Log from '~/common/log';

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
    };
}

export function handleError(dispatch : ReduxTypes.Dispatch, err : Error )
{
    if (err instanceof LogOnlyException)
    {
        Log.E(err.toString);
        Log.E(err.wrappedError);
    }
    else if (err instanceof CancelledException)
    {
        // We always do this on purpose
    }
    // Display these
    else if (err instanceof AuthorizationInvalidException)
    {
        // Simplify for user consumption
        toast( ToastType.ERROR, 10000, err.message);

        // This error means the access tokem is invalid
        // and the user should be logged out.
        dispatch(actions.authentication.logoutUserAction());

        Log.I(err.toString());
    }
    else if (err instanceof NetworkException)
    {
        if (err.code === 401)
        {
            // 401 from the server means access token invalidate, force a logout.
            dispatch(actions.authentication.logoutUserAction());

            // Simplify for user consumption
            toast
            ( ToastType.ERROR, 10000, err.message);

            Log.I(err.toString());
        }
        else
        {
            // Simplify for user consumption
            toast( ToastType.ERROR, 10000, err.message);

            Log.E(err);
        }
    }
    else
    {
        toast( ToastType.ERROR, 10000, err.message );
        Log.E(err);
    }
}
