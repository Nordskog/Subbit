import * as toast from '~/client/toast'
import * as actionTypes from '~/client/websocket/actionTypes'

export function handleError( payload : actionTypes.errors.ERROR )
{
    toast.toast( toast.ToastType.ERROR, 5000, payload.message);
}