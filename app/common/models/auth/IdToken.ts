import { LoginType } from './index';

export default interface id_token
{
    username?: string;
    admin_access? : boolean;
    stats_access? : boolean;
    loginType? : LoginType;
    raw? : string;
}