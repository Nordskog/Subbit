const path = require('path');
import * as Entities from '~/backend/entity'


const config =
{

    debug: true,
    stores:
    {
        defaultStore:
        {
            client: 'postgres',
            connection:
            {
                host: 'localhost',
                user: 'postgres',
                password: 'password',
                database: 'RFY_dev'
            },
        }
    },

    //After switching to node-ts instead of compiling to js first, I have been unable to use the entityPath option
    //This works just fine though
    entities:   [
                    Entities.Auth, 
                    Entities.Author,
                    Entities.Subreddit,
                    Entities.Subscription,
                    Entities.User,
                    Entities.UserSettings  
                ]

};

export default config;