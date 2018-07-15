import serverConfig from 'root/server_config';

export function isServer()
{
    return true;
}

export function getUseragent()
{
    return serverConfig.server.userAgent;
}

export function getVersion()
{
    return JSON.stringify(process.env.npm_package_version);
}