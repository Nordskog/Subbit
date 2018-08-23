export function numberTo4CharDisplayString(num : number)
{
    if (num < 10000)    // up to 10k
        return num;
    if (num < 100000)   // up to 100k
    {
        num = num / 1000;
        return num.toFixed(1) + 'k';
    }
    if (num < 1000000)  // up to 1m
    {
        num = num / 1000;
        return Math.floor(num) + 'k';
    }

    // This will never happen anyway, right? RIGHT?!
    return 'MOON';
}
