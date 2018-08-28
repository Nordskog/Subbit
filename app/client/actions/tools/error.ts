import * as ReduxTypes from './types';
import { Exception, CancelledException, NetworkException, AuthorizationInvalidException, LogOnlyException } from "~/common/exceptions";
import { toast, ToastType } from "~/client/toast";
import * as actions from '~/client/actions';
import * as Log from '~/common/log';
import { NetworkRequestDomain } from '~/common/models';
import config from 'root/config';

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
        if (err.code === 401 && err.source === NetworkRequestDomain.SUBBIT ) 
        {
            // 401 from the server means access token invalidate, force a logout.
            dispatch(actions.authentication.logoutUserAction());

            // Simplify for user consumption
            toast( ToastType.ERROR, 10000,  `${config.client.siteName}: ${err.message}`);

            Log.I(err.toString());
        }
        else
        {
            // Useful for the user to know which site caused the problem
            let sourceName = "";
            if (err.source === NetworkRequestDomain.REDDIT )
                sourceName = "Reddit: ";
            else if (err.source === NetworkRequestDomain.SUBBIT )
                sourceName = `${config.client.siteName}: `;

            // Simplify for user consumption
            toast( ToastType.ERROR, 10000, sourceName + err.message);

            Log.E(err);
        }
    }
    else
    {
        toast( ToastType.ERROR, 10000, err.message );
        Log.E(err);
    }
}
