import { LoginType } from './index';

export default interface AccessToken
{
    //In its decoded state
    scope : string;
    sub: string;
    generation: number;
    loginType: LoginType;
}