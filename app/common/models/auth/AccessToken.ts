import { LoginType } from './index';

export default interface AccessToken
{
    // In its decoded state
    scope : string;
    sub: string;
    generation: string;
    login_type: LoginType;
}
