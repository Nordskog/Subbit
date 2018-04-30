import * as RFY from '~/backend/rfy';
import * as Wetland from 'wetland';
import * as entities from '~/backend/entity';

//Keep a constnat ref to both of these, only modify via these.
let settings : entities.Setting = null;
let manager : Wetland.Scope = null;

export function getSettings()
{
    return settings;
}

export async function saveSettings()
{
    await manager.flush(true);
}

export async function loadSettings()
{
    manager = RFY.wetland.getManager();
    settings = await manager.getRepository(entities.Setting).findOne();
    if (settings == null)
    {
        await initSettings();
    }
}

//Called if table empty
async function initSettings()
{
    settings = manager.attach(new entities.Setting(), true);
    manager.persist(settings);
    await manager.flush(true);

}