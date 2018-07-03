import * as Entities from '~/backend/entity'
import serverConfig from 'root/server_config'


const config =
{
    stores:
    {
        defaultStore: serverConfig.database
    },

    //After switching to node-ts instead of compiling to js first, I have been unable to use the entityPath option
    //This works just fine though
    entities:   [
                    Entities.Auth, 
                    Entities.Author,
                    Entities.Subreddit,
                    Entities.Subscription,
                    Entities.User,
                    Entities.UserSettings,

                    Entities.StatsEntry,
                    Entities.StatsCategory,
                    Entities.StatsInterval  
                ]

};

export default config;