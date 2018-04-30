export function concatConditionals( operation : string, combiner : string, ...conditions : string[]  ) : string
{
    let builder = operation;
    conditions = conditions.filter( (value) => value != null );

    if (conditions.length < 1)
    {
        return "";
    }

    let divider = "";
    conditions.forEach( (condition : string) => 
    {
        builder = `${builder} ${divider} ${condition}`;
        divider = combiner;
    } )

    return builder;
}