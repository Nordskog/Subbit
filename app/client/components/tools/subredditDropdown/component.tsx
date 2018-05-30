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
    subscriptions : models.data.Subscription[];
    subreddit : string;
    changeSubreddit( subreddit : string ) : void; 
    viewAuthor( author : string, subreddit? : string) : void;
    filter : models.AuthorFilter;
    searchSubreddit( name : string) : Promise< string[] >;
}

interface State
{
    subreddits : components.tools.SearchList.ListItem[];
}


export default class SubredditDropdown extends React.Component<Props, State>
{
    state = { subreddits: []};
    
    static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
    {
        let subreddits: components.tools.SearchList.ListItem[]  = nextProps.subreddits.map(
            ( subreddit : models.data.Subreddit) => 
            {
                return {
                    name: subreddit.name,
                    highlighted: false,
                    object: subreddit.name
                }
            }
        );

        //Also add all subreddits from subscriptions
        {
            let subSet : Set<string> = new Set<string>();
            nextProps.subscriptions.forEach( (sub : models.data.Subscription) => 
            {
                sub.subreddits.forEach( ( subred : models.data.SubscriptionSubreddit ) => 
                {
                    subSet.add(subred.name);
                });
            });
            subSet.forEach( (name : string) => subreddits.push( { name: name, highlighted: false, object: name } ) );
        }

            subreddits.unshift( { name: "All", highlighted: false, object: "All"});
            subreddits.unshift( { name: "Frontpage", highlighted: false, object: null, prefix: ""});  //object null since home is no subreddit

        //We will also add two dummy items. ALL And HOME (frontpage);
        //The latter is checked for and passed to changeSubreddit as null

        return  { subreddits: subreddits };
    }

    constructor(props)
    {
        super(props);

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
                {this.getCurrentSubreddit()}
            </div>
            <div className='redditlist-expandButtonContainer'>
                {this.getExpandCaret()}
            </div>
        </div>

    </div>
    }

    getCurrentSubreddit()
    {
        if (this.props.subreddit != null)
        {
            return <span>r/<b>{this.props.subreddit}</b></span>;
        }
        return <b>Frontpage</b>
    }

    getSubredditsPopup( trigger : JSX.Element ) : JSX.Element
    {
        let subSearch : components.tools.SearchList.SearchItem = {
            items: this.state.subreddits,
            search: async ( name : string ) => { return ( await this.props.searchSubreddit(name) ).map( name => { return { name: name, object: name } }  ) },
            prefix: "r/",
            searchPlaceholder: "Subreddit",
            onClick: ( item : components.tools.SearchList.ListItem) => { return this.props.changeSubreddit(item.object) }
        }


        let authorSearch : components.tools.SearchList.SearchItem = {
            items: this.props.subscriptions.map(
                ( sub : models.data.Subscription) => 
                {
                    return {
                        name: sub.author,
                        highlighted: true,
                        alt: this.props.subreddit != null ? `in r/${this.props.subreddit}` : null
                    }
                }
            ),
            search: ( name : string ) => { return [{name: name, alt: this.props.subreddit != null ? `in r/${this.props.subreddit}` : null}] },   //Can't search for users :(
            prefix: "",
            searchPlaceholder: "Author",
            delaySearch : false,
            onClick: ( item : components.tools.SearchList.ListItem) => { this.props.viewAuthor(item.name) },
            onAltClick: ( item : components.tools.SearchList.ListItem) => { this.props.viewAuthor(item.name, this.props.subreddit) }
        }


        return <components.tools.SearchList.popup
                                trigger={ trigger }
                                items={[subSearch, authorSearch]} 
                                displayHighlight={true}
                                toggleHighlight={false}
                                addToDisplayList={false}
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