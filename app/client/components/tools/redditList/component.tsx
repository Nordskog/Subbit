import * as React from 'react';
import { NavLink} from 'redux-first-router-link'
import Link from 'redux-first-router-link'


import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

import 'css/redditlist.scss'

interface Props
{
    subreddits : models.data.Subreddit[];
    subreddit : string;
    filter : string;
}

interface State
{
    selected: number;
    items : ListItem[];
    expanded : boolean;
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
        this.state = { expanded : false, ...this.getStateUpdatedFromProps(props) };

        this.expand = this.expand.bind(this);
        this.collapse = this.collapse.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);

        this.handleSelectedClick = this.handleSelectedClick.bind(this);
        this.getSubredditLinkContent = this.getSubredditLinkContent.bind(this);

    }

    getStateUpdatedFromProps(props : Props)
    {
        let items : ListItem[] = [];
        let selected : number = 0;  //default to all

        //Top item is a null, corresponding to all
        items.push( { value: null, displayValue: 'r/all' } );
        props.subreddits.forEach(  (subreddit : models.data.Subreddit, index : number) =>
         {
             if (subreddit.name === props.subreddit)
             {
                 selected = index + 1;
             }
            items.push(  { value: subreddit.name, displayValue: `r/${subreddit.name}` } );
         } )

         return { items: items, selected: selected }
    }

    componentWillReceiveProps(nextProps : Props)
    {
        if (this.props.subreddit != nextProps.subreddit || this.props.subreddits != nextProps.subreddits )
        {
            this.setState( { expanded : false, ...this.getStateUpdatedFromProps(nextProps) } );
        }
    }

    render()
    {
        return  <div className="redditlist-container">
                        <div onClick={this.handleSelectedClick} className="redditlist-selectedContainer">
                            <div className="redditlist-selected">
                                {this.state.items[this.state.selected].displayValue}
                            </div>
                            <div className='redditlist-expandButtonContainer'>
                                {this.getExpandCaret()}
                            </div>
                        </div>
                        <div className="redditlist-listOuter">
                            {this.renderItems()}
                        </div>
                    </div>
                
    }

    getExpandCaret()
    {
        if (this.state.expanded)
            return  <svg className="redditlist-expandButton" >
                        <use xlinkHref={collapse_caret}></use>
                    </svg>
        else
            return  <svg className="redditlist-expandButton" >
                        <use xlinkHref={expand_caret}></use>
                    </svg>
    }

    renderItems()
    {
        if (this.state.expanded)
        {
            return <div className="redditlist-listContainer">
                { 
                    this.state.items.map( (item : ListItem, index : number ) => 
                        {
                            if (index != this.state.selected)
                                 return <NavLink className='redditlist-listItem' key={item.value} to={ this.getSubredditLinkContent(item.value) }>
                                        {item.displayValue}
                                    </NavLink>

                        } )
                }
             </div>
        }
        else
        {
            return <div/>
        }
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

    /*
    handleItemClick(index : number)
    {
        if (index != this.state.selected)
        {
            this.props.changeSubreddit(this.state.items[index].value);
        }

        this.setState(  {
            ...this.state,
            selected: index,
            expanded:false
        } );
    }
    */

    handleSelectedClick()
    {
        console.log("click");
        this.toggleMenu();
    }

    toggleMenu()
    {
        if (this.state.expanded)
            this.collapse();
        else
            this.expand();
    }

    collapse()
    {
        this.setState( 
            {
                 ...this.state,
                 expanded: false
            } )  
    }

    expand()
    {
        this.setState( 
            {
                 ...this.state,
                 expanded: true
            } )  
    }

    
    
}