import UserInfo from './UserInfo';

export default interface AuthState
{
    user: UserInfo;
    isAuthenticated: boolean;
}
