import * as entities from '~/backend/entity'
import * as Wetland from 'wetland'
import { PostDisplay } from '~/common/models';


export async function setPostDisplayMode(manager : Wetland.Scope, user : entities.User, mode : PostDisplay) : Promise<entities.User>
{
    user.settings.post_display_mode = mode;
    return user;
}