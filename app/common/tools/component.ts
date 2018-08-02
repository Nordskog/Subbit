export function getPadding( elm : Element )
{
    let computedStyle = getComputedStyle( elm );

    let verticalPadding = parseFloat( computedStyle.paddingTop ) + parseFloat( computedStyle.paddingBottom );
    let horizontalPadding = parseFloat( computedStyle.paddingLeft ) + parseFloat( computedStyle.paddingRight);
    
    if ( isNaN(verticalPadding) )
        verticalPadding = 0;
    if ( isNaN(horizontalPadding) )
        horizontalPadding = 0;

    return { verticalPadding: verticalPadding, horizontalPadding: horizontalPadding };
}