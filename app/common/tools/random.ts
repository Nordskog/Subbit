//Adapted from https://stackoverflow.com/a/105074/2312367
export function getRandomId( chunkCount : number = 8)
{
    function s4() 
    {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    let base : string = "";
    for (let i = 0; i < chunkCount; i++)
    {
        base = base.concat(s4());
    }

    return base;
  }