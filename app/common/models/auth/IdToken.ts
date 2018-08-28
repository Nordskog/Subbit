import { LoginType } from './index';

export default interface IdToken
{
    username?: string;
    admin_access? : boolean;
    stats_access? : boolean;
    loginType? : LoginType;
    raw? : string;
    expiry?: number;
}
