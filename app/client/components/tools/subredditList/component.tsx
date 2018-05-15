import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'

import * as siteStyles from 'css/site.scss'
import * as styles from 'css/subredditList.scss'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'
import subscribeButton from 'assets/images/subscribe_button.svg'


export interface displayedSubreddit
{
    name : string;
    highlighted : boolean;
}

interface Props
{
    subreddits: displayedSubreddit[];
    searchSubreddit( name : string) : Promise< string[] >;
    onClick( subreddit : displayedSubreddit ) : void;
    toggleHighlight: boolean;
    addToDisplayList: boolean;
}

interface State 
{
    displayedSubreddits :  displayedSubreddit[];
    searchSubreddits :  displayedSubreddit[];
    searching : boolean;
}

export default class RedditsCell extends React.Component<Props, State>
{
    inputTimeout = null;
    highlightedMap : Set<string> = new Set<string>();

    constructor(props)
    {
        super(props);

        //Props are effectively ignored on anything but initial construct

        this.state = { 
            displayedSubreddits: [].concat(this.props.subreddits), 
            searchSubreddits: [],
            searching: false
        };
        this.handleProps(props);
    }

    handleProps( props : Props)
    {
        this.highlightedMap.clear();
        this.props.subreddits.forEach( ( subreddit : displayedSubreddit ) => {  if (subreddit.highlighted){ this.highlightedMap.add(subreddit.name.toLowerCase()) } } )
    }

    /*
    componentWillReceiveProps(props : Props, state : State)
    {
        this.handleProps(props);

        let newState =         {
            ...this.state,
             displayedSubreddits: [].concat(props.subreddits) 
        };

        console.log("new state: ",newState);

        this.setState( newState );
    }
    */

    render()
    {
        return <div className={styles.subredditsContainer}>
                <input  onChange={ evt => this.handleInput( evt.target.value ) } 
                        type="text" 
                        placeholder="Search..."
                        className={ siteStyles.inputContainer }/>
                <div className={ styles.searchBarSpacer }/>
                {this.getSubreddits()}
                {this.getNoResultsIndicator()}
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

            if (input.length < 1)
            {
                this.setState(
                    {
                    ...this.state,
                    searchSubreddits: [],
                    searching: false
                    }
                );
            }
            else
            {

                this.searchSubreddit( input );
            }

            
        }, 500);

    }

    async searchSubreddit( name : string)
    {
        let searchResult : string[] = await this.props.searchSubreddit(name);

        this.setState( {
            ...this.state,
            searching: true,
             searchSubreddits: searchResult.map( ( subreddit : string ) => 
            {
                return {
                    name: subreddit,
                    highlighted: this.highlightedMap.has(subreddit.toLowerCase())
                }
            } ) } );
    }

    getSubreddits()
    {
        if (this.props.subreddits == null)
            return

        if (this.state.searching)
        {
            return this.state.searchSubreddits.map( subreddit => 
                {
                    return this.getSubreddit( subreddit);
                } )
        }
        else
        {
            return this.state.displayedSubreddits.map( subreddit => 
                {
                    return this.getSubreddit( subreddit);
                } )
        }
    }

    getNoResultsIndicator()
    {
        //99% copypasted from subreddit
        if (this.state.searching && (this.state.searchSubreddits == null || this.state.searchSubreddits.length < 1) )
        {
            return <div className={ styles.subscriptionSubredditContainer } >
                    <div 
                        className={ styles.subscriptionSubreddit }>
                        <b>No results</b>
                    </div>
                </div>
        }
    }
 
    getSubreddit(subreddit : displayedSubreddit)
    {
        return <div className={ styles.subscriptionSubredditContainer } key={subreddit.name} onClick={ () => this.handleClick(subreddit)  } >
                    {this.getIndicator(subreddit)}
                    <div 
                        className={ styles.subscriptionSubreddit }>
                        r/<b>{subreddit.name}</b>
                    </div>

                </div>
    } 

    getIndicator(subreddit : displayedSubreddit)
    {
        return <div className={ styles.indicatorContainer }>
                    <svg className={ subreddit.highlighted ? styles.unsubscribeIndicator : styles.subscribeIndicator } >
                        <use xlinkHref={subscribeButton}></use>
                    </svg>
                </div>
    }

    handleClick( subreddit :displayedSubreddit )
    {
        this.props.onClick( { ...subreddit });



        //un-highlight in display list
        if (subreddit.highlighted)
        {
            if (this.props.toggleHighlight)
                this.findInDisplay(subreddit.name).highlighted = false;
        }
        else
        {
           
            if (this.state.searching)
            {
                //Add to display list if it doesn't already exist
                if (this.props.toggleHighlight)
                    subreddit.highlighted = true;
                if (this.props.addToDisplayList)
                    this.state.displayedSubreddits.unshift(subreddit);
            }
            else
            {
                 //Highligh in displayList
                 if (this.props.toggleHighlight)
                     this.findInDisplay(subreddit.name).highlighted = true;
            }
        }

        this.setState( { ...this.state, searching: false } );

    }

    endSearch()
    {

    }

    findInDisplay( name : string)
    {
        return this.state.displayedSubreddits.find( ( subreddit : displayedSubreddit ) => { return subreddit.name.toLowerCase() == name.toLowerCase() } );
    }
}