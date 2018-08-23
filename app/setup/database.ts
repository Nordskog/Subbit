import * as RFY from '~/backend/rfy';

export async function setup()
{
    await RFY.initDatabase();
}
