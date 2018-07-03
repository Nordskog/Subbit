import * as Entities from '~/backend/entity'
import * as Wetland from 'wetland'

export async function getCount(manager : Wetland.Scope)
{
    let queryBuilder : Wetland.QueryBuilder<Entities.Author> = manager.getRepository(Entities.Author).getQueryBuilder("author");

    let count = await queryBuilder
                        .select({count: 'author.id'})
                        .getQuery()
                        .getSingleScalarResult();

    //Wetland typings wrong, returns string of value
    if ( typeof count == "string")
        count = Number.parseInt(count as any);

    return count;
}