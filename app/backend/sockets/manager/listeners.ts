import * as WebSocket from 'ws'; 
import * as events from '~/backend/events'
import * as entities from '~/backend/entity'
import * as models from '~/common/models'
import * as actions from '~/client/actions'
import * as scrape from '~/backend/scrape'
import * as api from '~/common/api'

const subscribedSockets : Set<WebSocket> = new Set<WebSocket>();

export function addSubscriber( ws : WebSocket)
{
    subscribedSockets.add(ws);

    //Request initial state
    scrape.scrapeBot.requestStateUpdate();
}

export function removeSubscriber( ws : WebSocket)
{
    subscribedSockets.delete(ws);
}

events.addJobUpdatedListener( ( job : entities.ScrapeJob ) => 
{
    subscribedSockets.forEach( ( ws : WebSocket ) => 
    {
        ws.send(
            api.rfy.wrapReducerAction( 
                    actions.types.manager.SCRAPE_JOBS_UPDATED,
                    [entities.ScrapeJob.formatModel(job)] as actions.types.manager.SCRAPE_JOBS_UPDATED )
        );


    });
});

events.addScrapeBotUpdatedListener( ( bot : models.data.ScrapeBot ) => 
{
    subscribedSockets.forEach( ( ws : WebSocket ) => 
    {

        ws.send(
            api.rfy.wrapReducerAction( 
                    actions.types.manager.SCRAPE_BOT_UPDATED,
                    bot as actions.types.manager.SCRAPE_BOT_UPDATED )
        );
    });
});