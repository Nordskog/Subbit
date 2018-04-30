import * as store from '~/client/store'
import * as models from '~/common/models'

export function handleMessage( req : models.Action<any> )
{
    console.log("Received reply!: ",req);

    switch(req.type)
    {
        case models.SocketAction.TOAST:
        {


            break;
        }

        case models.SocketAction.REDUCER_ACTION:
        {
            let dispatchReq : models.Action<models.Action<any>> = req;

            store.getStore().dispatch({
    
                type: dispatchReq.payload.type,
                payload: dispatchReq.payload.payload
            });
            break;
        }

        default:
        {
            console.log("Unknown action passed to client websocket:",req.type);
        }
    }
    

    
}