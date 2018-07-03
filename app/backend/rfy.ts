import { Wetland, EntityCtor, Entity, EntityRepository, Migrator } from 'wetland';
import { Request, Response } from 'express';
import * as Knex from 'knex';

import * as Entities from '~/backend/entity';

export let wetland : Wetland;
import config from './wetland';

export async function initDatabase()
{
    wetland = new Wetland(config);
    
    try
    {
        //Run any missing migrations
        let migrator: Migrator = wetland.getMigrator();
        let migrationsRun : string = await migrator.latest(Migrator.ACTION_RUN);

        if (migrationsRun == null)
        {
            //console.log("No migrations to run");
        }
        else
        {
            console.log(`Ran ${parseInt(migrationsRun)} migrations`);
        }
    }
    catch ( err )
    {
        console.log("Failed to run migrations");
        console.log(err);
    }
}

export function rawQuery() : Knex
{
    return wetland.getStore().getConnection();
}

export function getRepository<T extends Entity>(entity: string) : EntityRepository<T>
{
    let manager = wetland.getManager();
    return manager.getRepository(manager.getEntity(entity) as EntityCtor<T>);
}

export interface WetlandRequest extends Request
{
    wetland: Wetland;
}