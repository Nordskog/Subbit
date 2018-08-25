import * as os from 'os';
import childProcess from 'child_process';

export async function getMemoryUtlization() : Promise<number>
{
    let promise : Promise<number> = new Promise( ( resolve, reject ) => 
    {
        let totalMem = os.totalmem() / 1024 / 1024;
        let freeMem = 0;

        if (process.platform === "linux")
        {
            // freemem() on linux includes buff/cache, with no way of getting those valuese to compensate.
            // This grabs the available column from the output.
            childProcess.exec("free -m | grep Mem: | awk '{ print $7 }'", (error, stdout, stderr) => 
            {
                freeMem = parseInt( stdout.replace("/", ""), 10 );
                resolve( totalMem - freeMem );
            });
        }
        else
        {
            freeMem = os.freemem() / 1024 / 1024;
            resolve( totalMem - freeMem );
        }
    });

    return promise;
}
