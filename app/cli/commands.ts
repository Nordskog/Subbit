import * as RFY from '~/backend/rfy';
import * as entityActions from '~/backend/entityActions';
import * as Wetland from 'wetland';
import * as Entities from '~/backend/entity';

export enum Command
{
    USER = 'user',
    ROLE = 'role',
    HELP = 'help'
}

export enum CliUserRole
{
    ADMIN = 'admin',
    STATS = 'stats'
}

function printUser( user : Entities.User)
{
    console.log(`User ${user.username}: Admin: ${user.admin_access ? "yes" : "no"}, Stats: ${user.stats_access ? "yes" : "no"}`);
}

export async function handleCommand( command : Command, args : string[])
{

    await RFY.initDatabase();
    let manager : Wetland.Scope = RFY.wetland.getManager();

    switch(command)
    {   
        case Command.USER:
        case Command.ROLE:
        {
            /////////////////////////////
            // User common
            /////////////////////////////

            if (args[0] == null)
            {
                console.log("Please specify a username");
                break;
            }
            
            let user : Entities.User = await entityActions.user.getUser( manager, args[0] );

            if (user == null)
            {
                console.log("User not found");
                break;
            }

            ///////////////////////////
            // Diverge
            ///////////////////////////

            switch(command)
            {
                case Command.USER:
                {
                    printUser(user);
                    break;
                }

                case Command.ROLE:
                {
                    if ( args[2] == null)
                    {
                        console.log("Expected 'true' or 'false' parameters following role, got",args[2]);
                        break;
                    }

                    // tslint:disable-next-line:triple-equals
                    let enabled : boolean = args[2] == 'true';
                    let role : CliUserRole = args[1] as any;

                    switch(role)
                    {
                        case CliUserRole.ADMIN:
                        {
                            user.admin_access = enabled;
                            await manager.flush();
                            break;
                        }

                        case CliUserRole.STATS:
                        {
                            user.stats_access = enabled;
                            await manager.flush();
                            break;
                        }

                        default:
                        {
                            console.log("Expected 'stats' or 'admin' role parameter, got",role);
                            break;
                        }
                    }

                    printUser(user);
                }
            }

            break;
        }

        case Command.HELP:
        {
            console.log("Available commands:");
            console.log("");
            console.log("user [USERNAME]                        print user info");
            console.log("role [USERNAME] [ROLE] [ENABLED]       toggle user role");
            console.log("");
            console.log("Valid arguments: ");
            console.log("");
            console.log("ENABLED:   true or false");
            console.log("ROLE:      admin or stats");
            console.log("USERNAME:  Case-sensitive username");
            break;
        }

        default:
        {
            console.log("Unknown command, run cli help for help");
        }
    }

    process.exit();
}
