import * as store from '~/client/store';

export function getAccessToken(state: store.State)
{
    if (state.authState.isAuthenticated)
    {
        return state.authState.user.access_token;
    }
    else
    {
        return null;
    }
}

export function getUsername(state: store.State)
{
    if (state.authState.isAuthenticated)
    {
        return state.authState.user.id_token.username;
    }
    else
    {
        return null;
    }
}
