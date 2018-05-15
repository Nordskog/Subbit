import * as actions from '~/client/actions'
import * as authority from '~/client/authority'

export function clearPage( loading : boolean, dispatch)
{
    authority.author.clearAuthority();

    dispatch({
        type: actions.types.page.NEW_PAGE,
        payload: {
            loading: loading
        } as actions.types.page.NEW_PAGE
    })
}