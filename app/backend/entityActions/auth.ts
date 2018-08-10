import * as Entities from '~/backend/entity'
import * as Wetland from 'wetland'
import * as redditAuth from '~/backend/authentication/redditAuth'


export async function nukeGeneration( user : Entities.User )
{
    user.generation = redditAuth.getGeneration();
}

