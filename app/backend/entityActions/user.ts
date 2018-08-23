import * as Entities from '~/backend/entity';
import * as Wetland from 'wetland';
import { PostDisplay } from '~/common/models';

export async function getUser( manager : Wetland.Scope, username : string, options? : any )
{
    if (options == null)
        options = {};
    return await manager.getRepository(Entities.User).findOne({ username: username }, { ...options });
}

export async function setPostDisplayMode(manager : Wetland.Scope, user : Entities.User, mode : PostDisplay) : Promise<Entities.User>
{
    user.settings.post_display_mode = mode;
    return user;
}

export async function getCount(manager : Wetland.Scope)
{
    let queryBuilder : Wetland.QueryBuilder<Entities.User> = manager.getRepository(Entities.User).getQueryBuilder("u");

    let count = await queryBuilder
                        .select({count: 'u.id'})
                        .getQuery()
                        .getSingleScalarResult();

    // Wetland typings wrong, returns string of value
    if ( typeof count === "string")
        count = Number.parseInt(count as any, 10);
        
    return count;
}
