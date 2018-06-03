import * as Entities from '~/backend/entity'
import * as Wetland from 'wetland'
import { PostDisplay } from '~/common/models';


export async function setPostDisplayMode(manager : Wetland.Scope, user : Entities.User, mode : PostDisplay) : Promise<Entities.User>
{
    user.settings.post_display_mode = mode;
    return user;
}