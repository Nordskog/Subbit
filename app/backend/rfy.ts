import { Wetland, EntityCtor, Entity, EntityRepository } from 'wetland';
import { Request, Response } from 'express';
import * as Knex from 'knex';

import * as Entities from '~/backend/entity';

export let wetland : Wetland;
import config from './wetland';

export async function initDatabase()
{
	wetland = new Wetland(config);
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