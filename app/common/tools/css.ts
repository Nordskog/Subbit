export function classConcat( ...clazz : string[] )
{
    let filtered = clazz.filter( (str) => str != null );
    return filtered.join(' ');
}