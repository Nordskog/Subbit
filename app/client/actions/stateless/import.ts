import { PostDisplay } from "~/common/models";
import * as actions from '~/client/actions';
import { api, tools, models } from "~/common";
import { State } from "~/client/store";
import { WrapWithHandler, handleError } from "~/client/actions/tools/error";
import { Dispatch, GetState } from "~/client/actions/tools/types";

import { Thing, Message, Listing, ImportStatus } from '~/common/models/reddit';
import { ImportedSubscription } from "~/common/models/data";
import { subreddits } from "~/client/actions/stateless";

export async function checkForUpdateMeBotReply( dispatch : Dispatch ) : Promise< ImportStatus >
{
    return new Promise<ImportStatus>( ( resolve, reject ) => 
    {
        dispatch( async (dispatch : Dispatch, getState : GetState) => 
        {
            try 
            {
                let state = getState();
        
                let listing : Thing< Listing<Message> > = await api.reddit.user.getPrivateMessagesInbox(5, state.authState.user.reddit_auth_additional);
                let messages : Thing<Message>[] = listing.data.children;
        
                messages = messages.filter( ( message : Thing<Message> ) => 
                {
                    if ( message.data.author !== "UpdateMeBot" )
                        return false;
                    if (message.data.subject !== "re: List Of Updates")
                        return false;
                    
                    // Accept anything less than A DAY old
                    if (message.data.created_utc < ( ( Date.now() / 1000 ) - (60 * 60 * 24) )  )
                        return false;
                    
        
                    return true;
                });
        
                if (messages.length > 0)
                {
                    let exp = new RegExp( /SubscribeMe each time \/u\/([^\s]+) posts in \/r\/([^\s.\\]+)/g );
        
                    // Subscriptions in separate subreddits are completely separate.
                    // Read everything into a map to get all subscribed subreddits for any given author
                    // There should be no duplicates, but that backend should cope with any that might appear.
                    // UpdateMeBot does not allow you to subscribe in all subreddits

                    let subscriptions : Map<string, ImportedSubscription> = new Map<string, ImportedSubscription>();

                    let match = null;
                    let matchCount = 0;
                    // tslint:disable-next-line:no-conditional-assignment
                    while ( ( match = exp.exec(messages[0].data.body) ) != null  )
                    {
                        let name = match[1];
                        let subreddit = match[2];
                        let sub = subscriptions.get(name);
                        if (sub == null)
                        {
                            sub = {
                                author: name,
                                subreddits: [],
                            };
                            subscriptions.set(name, sub);
                        }

                        sub.subreddits.push(subreddit);

                        matchCount++;
                    }

                    resolve( ImportStatus.MESSAGE_FOUND );

                    let subscriptionsArray = [];
                    for (let [author, sub] of subscriptions)
                    {
                        subscriptionsArray.push(sub);
                    }

                    dispatch({
                        type: actions.types.user.SUBSCRIPTIONS_IMPORTED,
                        payload: subscriptionsArray as actions.types.user.SUBSCRIPTIONS_IMPORTED
                    });
        
                }
                else 
                {
                    resolve( ImportStatus.MESSAGE_NOT_FOUND );
                }
            }
            catch ( err )
            {
                handleError( dispatch, err );
                resolve( ImportStatus.ERROR );
            }
        });

    });

}

export async function checkForRecentUpdateMeBotListRequest( dispatch : Dispatch ) : Promise< boolean >
{
    return new Promise<boolean>( ( resolve, reject ) => 
    {
        dispatch( async (dispatch : Dispatch, getState : GetState) => 
        {
            try 
            {
                let state = getState();
        
                let listing : Thing< Listing<Message> > = await api.reddit.user.getPrivateMessagesOutbox(5, state.authState.user.reddit_auth_additional);
                let messages : Thing<Message>[] = listing.data.children;
        
                messages = messages.filter( ( message : Thing<Message> ) => 
                {
                    if ( message.data.dest !== "UpdateMeBot" )
                        return false;
                    if (message.data.body !== "MyUpdates")
                        return false;
                    
                    // Must be less than 10 minutes old
                    if (message.data.created_utc < ( ( Date.now() / 1000 ) - ( 60 * 10 ) )   )
                        return false;
                    
                    return true;
                });
        
                if (messages.length > 0)
                {
                    resolve(true);
        
                }
                else 
                {
                    resolve(false);
                }
            }
            catch ( err )
            {
                handleError( dispatch, err );
                resolve( false );
            }
        });

    });

}


export async function requestSubscriptionsFromUpdateMeBot( dispatch : Dispatch ) : Promise< boolean >
{
    return new Promise<boolean>( ( resolve, reject ) => 
    {
        dispatch( async (dispatch : Dispatch, getState : GetState) => 
        {
            try 
            {
                let state = getState();
        
                await api.reddit.user.sendPrivateMessage("UpdateMeBot", "List Of Updates", "MyUpdates", state.authState.user.reddit_auth_additional);
                resolve(true);
    
            }
            catch ( err )
            {
                handleError( dispatch, err );
                resolve( false );
            }
        });

    });

}
