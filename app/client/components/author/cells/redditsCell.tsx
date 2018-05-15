import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'

import * as siteStyles from 'css/site.scss'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'


interface Props
{
    subreddits: models.data.SubscriptionSubreddit[];
    addSubscriptionSubreddit( subreddit : string ): void;
    removeSubscriptionSubreddit( subreddit : string): void;
    searchSubreddit( name : string) : Promise< String[] >
}

interface State 
{
    displayedSubreddits :  models.data.SubscriptionSubreddit[];
}

export default class RedditsCell extends React.Component<Props, State>
{
    inputTimeout = null;

    constructor(props)
    {
        super(props);

        let testStrings = ['test1', 'test2', 'test3'];

        this.state = { displayedSubreddits: testStrings.map( ( subreddit : string, index : number ) => 
            {   
                return {
                    id: -1,
                    name: subreddit,
                    subscribed : index == 0
                }
            })};
    }

    render()
    {
        return <div className="author-subredditsContainer">
                <input onChange={ evt => this.handleInput( evt.target.value ) } type="text" className={ siteStyles.inputContainer }/>
                {this.getSubreddits()}
                </div>
    }

    //Wait a bit after input end before sending request
    handleInput( input : string)
    {
        if (this.inputTimeout != null)
        {
            clearTimeout( this.inputTimeout );
        }

        this.inputTimeout = setTimeout(() => {

            this.inputTimeout = null;
            this.searchSubreddit( input );
            
        }, 500);

    }

    searchSubreddit( name : string)
    {
        console.log("Search",name);
    }

    getSubreddits()
    {
        if (this.props.subreddits == null)
            return

        return this.state.displayedSubreddits.map( subreddit => 
            {
                return this.getSubreddit( subreddit.name, subreddit.subscribed);
            } )
    }

    getSubreddit(subredditName : string, subscribed : boolean)
    {
        return <div key={subredditName}
                        onClick={ subscribed ?  () => this.props.removeSubscriptionSubreddit(subredditName) : 
                                                () => this.props.addSubscriptionSubreddit(subredditName) }
                     className={ subscribed ? "author-subscribedSubreddit" : "author-subscriptionSubreddit" }>
                    r/{subredditName}
                    </div>
    } 



}