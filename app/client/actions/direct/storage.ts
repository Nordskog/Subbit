import { models } from "~/common";
import { State } from '~/client/store';
import { GetState } from "~/client/actions/tools/types";
import { Subscription } from "~/common/models/data";
import { LoginType } from "~/common/models/auth";

export function saveLastVisit( lastvisit : number)
{
    localStorage.setItem('local_data_last_visit', JSON.stringify(lastvisit));
}

export function loadLastVisit() : number
{
    let lastVisit : any = localStorage.getItem('local_data_last_visit');
    if (lastVisit != null)
    {
        lastVisit = JSON.parse(lastVisit) as number;
    }

    return lastVisit;
}

export function loadSubscriptions() : models.data.Subscription[]
{
    let subs : any = localStorage.getItem('local_data_subscriptions');
    if (subs != null)
    {
        subs = JSON.parse(subs) as models.data.Subscription[];
    }

    return subs;
}

export async function saveSubscriptions( getState : GetState )
{
    let state : State = getState();

    // No permanent storage if session login
    if (state.authState.isAuthenticated && state.authState.user.id_token.loginType === LoginType.SESSION)
        return;

    let subscriptions : Subscription[] = state.userState.subscriptions;
    localStorage.setItem('local_data_subscriptions', JSON.stringify(subscriptions));
}

export function clear()
{
    // Called on logout.
    localStorage.removeItem("local_data_subscriptions");
    localStorage.removeItem("local_data_last_visit");
}
