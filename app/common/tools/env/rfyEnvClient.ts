import config from 'root/config';

export function isServer()
{
    return false;
}

export function getUseragent()
{
    return config.client.userAgent;
}

export function getVersion()
{
    return RFY_VERSION;
}