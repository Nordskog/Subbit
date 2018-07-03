///////////////////////////////////////
// CLI for adding special permissions
///////////////////////////////////////

//Path configs that mirror those found in tsconfig
//because apparently ts-node ignores those
require('module-alias').addAlias("~", __dirname + "/../");
require('module-alias').addAlias("css", __dirname + "/../../css");
require('module-alias').addAlias("root", __dirname + "/../../");

import { Command, handleCommand } from './commands';

let command : Command = process.argv[2] as Command;
if (command == null)
{
    console.log("No command defined")
}

let args : string[] = process.argv.slice(3, process.argv.length);

handleCommandWrapper(command, args );

async function handleCommandWrapper( command, args)
{
    try
    {
        await handleCommand(command, args );
    }
    catch ( err )
    {
        console.log(err);
        process.exit(1);

    }
}