export function parseId( id : string) : number
{
    return parseInt( id.split('_')[1] );
}