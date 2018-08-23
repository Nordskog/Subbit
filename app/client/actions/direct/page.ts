import * as actions from '~/client/actions';
import * as authority from '~/client/authority';
import * as api from '~/common/api';
import { LoadingStatus } from '~/common/models';
import { Dispatch } from '~/client/actions/tools/types';

export function clearPage( loading : boolean, dispatch : Dispatch)
{
    authority.author.clearAuthority();
    api.cancelAll();

    dispatch({
        type: actions.types.page.NEW_PAGE,
        payload: {
            status: LoadingStatus.LOADING
        } as actions.types.page.NEW_PAGE
    });
}
