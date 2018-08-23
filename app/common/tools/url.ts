export function appendUrlParameters(baseUrl: string, argValPairs)
{
    if (argValPairs == null)
        return baseUrl;

    let separator = '?';
    for (let key of Object.keys(argValPairs))
    {
        if (argValPairs[key] == null)
        continue;
        baseUrl = baseUrl + separator + key + '=' + argValPairs[key];
        separator = '&';
    }

    return baseUrl;
}

export function formatAsPostForm(argValPairs)
{
    let separator = '';
    let output = '';
    for (let key of Object.keys(argValPairs))
    {
        if (argValPairs[key] == null)
            continue;
        output = output + separator + key + '=' + argValPairs[key];
        separator = '&';
    }

    return output;
}
