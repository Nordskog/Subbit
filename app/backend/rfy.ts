import { Wetland, EntityCtor, Entity, EntityRepository } from 'wetland';
import { Request, Response } from 'express';
import * as Knex from 'knex';

import * as Entities from '~/backend/entity';

export let wetland : Wetland;

export async function initDatabase()
{
	wetland = new Wetland(require('./wetland'));

	//Does not get executed unless you await... what?
	//TODO investigate this nonsense
	await rawQuery().raw(updateHotscoreFunction, {});
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

export function postgresJsonResult( rawPostgresResult )
{
    return rawPostgresResult.rows[0].json;
}

///////////////////////
//Add function to db
///////////////////////

const updateHotscoreFunction = 
`
CREATE OR REPLACE FUNCTION calculate_hot_score(score integer, created_utc real, current_utc real) RETURNS integer AS $$
DECLARE 
	rez integer;
	ord real;
	seconds real;
BEGIN
	ord = score;
	IF score < 1 THEN score = 1; END IF;
	ord = log(10,score);
	seconds = created_utc  - 1134028003;
	if score < 0 THEN ord = ord * -1; END IF;
	rez =  ( ord + seconds / 45000 ) * 1000;
	RETURN ROUND( rez + current_utc );
END;
$$ LANGUAGE plpgsql; 
`;

