import * as models from '~/common/models';
import * as actions from '~/client/actions';

// The auth reducer. The starting state sets authentication
// based on a token being in local storage. In a real app,
// we would also want a util to check if the token is expired.
export function authStateReducer(state : models.auth.AuthState = getDefaultAuthState(), action : models.Action<any>)
{
    switch (action.type)
    {

        case actions.types.authentication.REDDIT_TOKEN_UPDATED:
        {
            action = action as models.Action< actions.types.authentication.REDDIT_TOKEN_UPDATED >;

            return {
                ...state,
                user: 
                {
                    ...state.user,
                    reddit_auth: action.payload
                }
            };
        }
        case actions.types.authentication.LOGOUT_SUCCESS:
        {
            action = action as models.Action< actions.types.authentication.LOGOUT_SUCCESS >;
            return {
                ...state,
                ...getDefaultAuthState()
            };
        }

        case actions.types.authentication.LOGIN_SUCCESS:
        {
            action = action as models.Action< actions.types.authentication.LOGIN_SUCCESS >;
            return {
                isAuthenticated: true,
                user: action.payload,
            };
        }

        default:
            return state;

            ///////////////////
            // ROUTES
            ///////////////////
    }
}

export function getDefaultAuthState(userInfo?: models.auth.UserInfo) : models.auth.AuthState
{
    if (userInfo != null)
    {
        return {
            isAuthenticated: true,
            user: userInfo,
        };
    }
    else
    {
        return {
            isAuthenticated: false,
            user: {
                id_token: {
                    username: ''
                },
                access_token: undefined,
                reddit_auth: null,
                reddit_auth_additional: null
            },
        };
    }
}
