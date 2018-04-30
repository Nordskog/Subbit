//Modified from reddit's old ranking algorithm
//We also add current unix time (seconds) so older posts will be pushed down
//even if we don't update their hot scores.
//This must match the database function
export function calculateHotScore(s : number, created_utc : number) : number
{
    let ord : number  =  Math.abs(s);
    if (ord < 1)
        ord = 1;

    ord = Math.log10( ord );

    if ( s < 0)
        ord = ord * -1;

    let seconds : number  = created_utc - 1134028003
    let hot_score : number = (ord + seconds / 45000 ) * 1000;

    return  Math.round(  (Date.now() / 1000) + hot_score );
}


