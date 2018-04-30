import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'


interface Props
{
    subreddits: models.data.SubscriptionSubreddit[];
    addSubscriptionSubreddit( subredditId : number ): void;
    removeSubscriptionSubreddit( subredditId : number): void;
}

export default class RedditsCell extends React.Component<Props, null>
{

    render()
    {
        return <div className="author-subredditsContainer">
                {this.getSubreddits()}
                </div>
    }

    getSubreddits()
    {
        if (this.props.subreddits == null)
            return

        return this.props.subreddits.map( subreddit => 
            {
                return this.getSubreddit(subreddit.id, subreddit.name, subreddit.subscribed);
            } )
    }

    getSubreddit(subredditId: number, subredditName : string, subscribed : boolean)
    {
        return <div key={subredditId}
                        onClick={ subscribed ?  () => this.props.removeSubscriptionSubreddit(subredditId) : 
                                                () => this.props.addSubscriptionSubreddit(subredditId) }
                     className={ subscribed ? "author-subscribedSubreddit" : "author-subscriptionSubreddit" }>
                    r/{subredditName}
                    </div>
    } 



}