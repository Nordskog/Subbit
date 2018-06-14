import * as React from 'react';
import { NavLink} from 'redux-first-router-link'
import Link from 'redux-first-router-link'


import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

import * as components from '~/client/components'

import * as styles from "css/redditlist.scss"

interface Props
{
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
        let subreddits: components.tools.SearchList.ListItem[]  = [];

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
        return  <div className={styles.container}>

        <div  className={styles.selectedContainer}>
            <div className={styles.selected}>
                {this.getCurrentSubreddit()}
            </div>
            <div className={styles.expandButtonContainer}>
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
            toggleHighlight: false,
            displayHighlight : false,
            addToDisplayList : false,
            items: this.state.subreddits,
            search: async ( name : string ) => { return ( await this.props.searchSubreddit(name) ).map( name => { return { name: name, object: name } }  ) },
            prefix: "r/",
            searchPlaceholder: "Subreddit",
            onClick: ( item : components.tools.SearchList.ListItem) => { this.props.changeSubreddit(item.object); return true; }
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
            displayHighlight: true,
            toggleHighlight : false,
            addToDisplayList : false,
            delaySearch : false,
            onClick: ( item : components.tools.SearchList.ListItem) => { this.props.viewAuthor(item.name); return true },
            onAltClick: ( item : components.tools.SearchList.ListItem) => { this.props.viewAuthor(item.name, this.props.subreddit) }
        }

        return <components.tools.SearchList.popup
                                trigger={ trigger }
                                items={[subSearch, authorSearch]} 
        />
    
    }

    getExpandCaret()
    {
        return  <svg className={styles.expandButton} >
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