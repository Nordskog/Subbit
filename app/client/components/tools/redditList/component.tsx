import * as React from 'react';
import { NavLink} from 'redux-first-router-link'
import Link from 'redux-first-router-link'


import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

import * as components from '~/client/components'
import 'css/redditlist.scss'

interface Props
{
    subreddits : models.data.Subreddit[];
    subreddit : string;
    changeSubreddit( subreddit : string ) : void; 
    filter : models.AuthorFilter;
}

interface State
{
    subreddits : ListItem[];
}

interface ListItem
{
    value : any;
    displayValue : string;
}

export default class RedditListComponent extends React.Component<Props, State>
{

    constructor(props)
    {
        super(props);
        this.state = { subreddits: [] };
    }

    render()
    {
        return this.getSubredditsPopup( this.getButton() );

    }

    getButton()
    {
        return  <div className="redditlist-container">

        <div  className="redditlist-selectedContainer">
            <div className="redditlist-selected">
                r/{this.props.subreddit}
            </div>
            <div className='redditlist-expandButtonContainer'>
                {this.getExpandCaret()}
            </div>
        </div>

    </div>
    }

    getSubredditsPopup( trigger : JSX.Element ) : JSX.Element
    {
        return <components.tools.subredditList.popup
                                trigger={ trigger }
                                subreddits={this.props.subreddits.map
                                (
                                    ( subreddit : models.data.SubscriptionSubreddit) => 
                                    {
                                        return {
                                            name: subreddit.name,
                                            highlighted: subreddit.subscribed
                                        }
                                    }
                                )} 
                                onClick={ (subreddit : components.tools.subredditList.displayedSubreddit, close : () => void ) => 
                                { 
                                    close();
                                    this.props.changeSubreddit(subreddit.name);
                                }}
                                toggleHighlight={true}
                                addToDisplayList={true}
        />
        


    }

    getExpandCaret()
    {
        return  <svg className="redditlist-expandButton" >
                    <use xlinkHref={expand_caret}></use>
                </svg>
    }


    getSubredditLinkContent(subreddit : string)
    {
        if (subreddit == null)
        {
           return {  type: this.props.filter.toUpperCase() }
        }
        else
        {
           return { type: 'SUBREDDIT', payload: { subreddit: subreddit, filter:this.props.filter } };
        }
    }
}