const path = require('path');


module.exports =
{
    //entityPath: path.resolve(process.cwd(), 'app', 'api', 'entity'),  //Path ends up being different
    entityPath: 'app/backend/entity',
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
    }

   

};