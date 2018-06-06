import * as React from 'react';


import * as models from '~/common/models';

import * as tools from '~/common/tools'

import * as siteStyles from 'css/site.scss'
import * as styles from 'css/subredditList.scss'
import * as components from '~/client/components'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'
import subscribeButton from 'assets/images/subscribe_button.svg'

import * as transitions from 'react-transition-group'

export interface ListItem
{
    name : string;
    alt? : string;
    highlighted : boolean;
    object?: any;   //Used specified
    prefix?: string;    //Override SearchItem
}

interface SearchResult
{
    name: string;
    alt?: string;
    object?: any;
}

export interface SearchItem 
{
    items: ListItem[];
    search( name : string) : SearchResult[] | Promise<SearchResult[]>;
    searchPlaceholder : string;
    onClick( item : ListItem ) : boolean | undefined;
    onAltClick?( item : ListItem ) : void;
    prefix: string;
    highlightMap?: Set<string>;
    delaySearch?: boolean
    emptyMessage?: string;

}

interface Props
{
    items: SearchItem[] | SearchItem;
    displayHighlight: boolean;
    toggleHighlight: boolean;
    addToDisplayList: boolean;
    onClick?( item : ListItem ) : boolean | undefined
    onAltClick?( item : ListItem ) : void;
}

interface State 
{
    items : SearchItem[];
    selectedItem : number;
    searchedItems :  ListItem[];
    searching : boolean;
}

export default class RedditsCell extends React.Component<Props, State>
{
    inputTimeout = null;
    container : HTMLDivElement;

    constructor(props)
    {
        super(props);

        //Input may be array of single item
        let items : SearchItem[];
        if (this.props.items instanceof Array)
            items = this.props.items;
        else
            items = [this.props.items];

        //Setup highlight map for each item.
        //This really doesn't need to be in state but eh
        items.forEach( ( item : SearchItem ) => 
        {
            item.delaySearch = item.delaySearch != null ? item.delaySearch : true;
            item.highlightMap = new Set<string>();
            item.items.forEach( ( listItem : ListItem ) => {  if (listItem.highlighted){ item.highlightMap.add(listItem.name.toLowerCase()) } } )
        });
        
        //Just select first if only one present
        let selectedItem : number = null;
        if (items.length <= 1)
        {
            selectedItem = 0;
        }

        this.state = { 
            items: items,
            searchedItems: [],
            searching: false,
            selectedItem: selectedItem
        };
    }

    shouldComponentUpdate(nextProps : Props, nextState : State)
    {
        //We handle everything ourselves, so ignore updates from parent,
        //otherwise we end up with animation-confusing duplicate renders
        if (nextState != this.state)
        {
            return true;
        }

        return false;
    }

    render()
    {
        return <div className={styles.subredditsContainer} >
                    <div className={styles.searchContainer}>
                        <transitions.TransitionGroup >
                            {this.getSearchBoxes()}
                        </transitions.TransitionGroup>
                    </div>
                    <div className={ styles.searchBarSpacer }/>
                    <components.animations.AutoSize>
                        <div style={  { height: 'auto', overflow: 'hidden' } } >
                            {this.getListItems()}
                            {this.getEmptyListIndicator()}
                        </div>
                    </components.animations.AutoSize>
                </div>
    }

    getSearchBoxes()
    {
        let boxes = [];

        if (this.state.selectedItem == null)
        {
            this.state.items.forEach( (item : SearchItem, index : number) => 
            {
                boxes.push( this.getSearchBox(item, index) );
            });
        }
        else
        {
            //Push only the selected item
            boxes.push( this.getSearchBox( this.state.items[this.state.selectedItem], this.state.selectedItem) );
        }

        return boxes;
    }

    getSelectedItem()
    {
        let itemIndex = 0;
        if (this.state.selectedItem != null)
            itemIndex = this.state.selectedItem;

        return this.state.items[itemIndex];
    }

    getSearchBox( item : SearchItem, index : number )
    {
       return   <components.transitions.FadeResize key={"Search_"+index}>
                    <input 
                        onFocus={() => this.selectMode(index)} 
                        onChange={ evt => this.handleInput( item, evt.target.value ) } 
                        onKeyPress={ (e :  React.KeyboardEvent<HTMLInputElement>) => {  this.handleEnter(e.which)  } }
                        type="text" 
                        placeholder={item.searchPlaceholder}
                        className={ siteStyles.inputContainer }/>
                </components.transitions.FadeResize>
                                 
    }

    selectMode( index : number)
    {
        this.setState( { ...this.state, selectedItem: index } );
    }

    handleEnter(keyCode : number)
    {
        if (keyCode == 13 && this.state.searchedItems.length > 0)
        {
            let item : SearchItem = this.getSelectedItem();
            let listItem = this.state.searchedItems[0];

            this.handleClick(item, listItem);
        }
    }

    //Wait a bit after input end before sending request
    handleInput( item : SearchItem, input : string)
    {
        if (this.inputTimeout != null)
        {
            clearTimeout( this.inputTimeout );
            this.inputTimeout = null;
        }

        if (item.delaySearch)
        {
            this.inputTimeout = setTimeout(() => {

                this.inputTimeout = null;
    
                if (input.length < 1)
                {
                    this.setState(
                        {
                        ...this.state,
                        searchedItems: [],
                        searching: false
                        }
                    );
                }
                else
                {
                    this.search( item, input );
                }
    
                
            }, 500);
        }
        else
        {
            if (input.length < 1)
            {
                this.setState(
                    {
                    ...this.state,
                    searchedItems: [],
                    searching: false
                    }
                );
            }
            else
            {
                this.search( item, input );

            }
        }
    }

    async search( item : SearchItem, name : string)
    {
        let searchResult : SearchResult[] = await item.search(name);

        this.setState( {
            ...this.state,
            searching: true,
             searchedItems: searchResult.map( ( res : SearchResult ) => 
            {
                return {
                    name: res.name,
                    alt: res.alt,
                    object: res.object,
                    highlighted: item.highlightMap.has( res.name.toLowerCase())
                }
            } ) } );
    }

    getListItems()
    {
        let selecteItem : SearchItem = this.getSelectedItem();

        if (this.state.searching)
        {
            return this.state.searchedItems.map( subreddit => 
                {
                    return this.getListItem( subreddit, selecteItem);
                } )
        }
        else
        {
            return selecteItem.items.map( item  => 
                {
                    return this.getListItem( item, selecteItem );
                } )
        }
    }


 
    getListItem(listItem : ListItem, searchItem : SearchItem)
    {
        return <div className={ styles.subscriptionSubredditContainer } key={listItem.name}  onClick={ () => this.handleClick(searchItem, listItem)}  >
                    <div className={ styles.subscriptionSubredditInnerContainer } >
                        {this.getIndicator(listItem)}
                        <div className={ styles.subscriptionSubreddit }>
                            {this.getPrefix(listItem,searchItem)}<b>{listItem.name}</b>
                        </div>
                    </div>
                    {this.getAltBox(listItem, searchItem)}
                </div>
    } 

    getPrefix(listItem : ListItem, searchItem : SearchItem)
    {
        if (listItem.prefix != null)
            return listItem.prefix;
        return searchItem.prefix;
    }

    getAltBox(listItem : ListItem, searchItem : SearchItem)
    {
        if (listItem.alt != null)
        {
            return <div className={styles.altBox} onClick={ (event : React.MouseEvent<HTMLDivElement>) => this.handleAltClick(event, searchItem, listItem,) }>
                        {listItem.alt}
                    </div>
        }
    }

    getEmptyListIndicator()
    {

        let message : string = null;
        let selectedItem : SearchItem = this.getSelectedItem();
        if (this.state.searching && (this.state.searchedItems == null || this.state.searchedItems.length < 1) )
        {
            message = "No results";
        }
        else if ( !this.state.searching &&  ( selectedItem.items == null || selectedItem.items.length < 1 ) )
        {
            message = selectedItem.emptyMessage;
        }

        if (message != null)
        {
                return <div className={ styles.subscriptionSubredditContainer } >
                            <div 
                                className={ styles.subscriptionSubreddit }>
                                <b>{message}</b>
                            </div>
                        </div>
        }
    }

    getIndicator(subreddit : ListItem)
    {
        return <div className={ styles.indicatorContainer }>
                    <svg className={ subreddit.highlighted ? styles.unsubscribeIndicator : styles.subscribeIndicator } >
                        <use xlinkHref={subscribeButton}></use>
                    </svg>
                </div>
    }

    handleAltClick( event : React.MouseEvent<HTMLDivElement>, searchItem: SearchItem, listItem : ListItem)
    {

        if (this.props.onAltClick != null || searchItem.onAltClick != null)
        {
            event.stopPropagation();

            if (this.props.onAltClick != null)
            {
                this.props.onAltClick(listItem);
            }
    
            if(searchItem.onAltClick != null)
            {
                searchItem.onAltClick(listItem);
            }
        }

    }

    handleClick( searchItem: SearchItem, listItem : ListItem )
    {

        if (this.props.onClick != null)
        {
            let callbackReturn : boolean = this.props.onClick( listItem );

            if (callbackReturn != null && !callbackReturn )
            {
                //Callback returned false, do nothing
                return;
            }
        }

        //This causes a prop update, which we ignore
        if (searchItem.onClick != null)
        {
            let callbackReturn : boolean = searchItem.onClick(  listItem );
            if (callbackReturn != null && !callbackReturn )
            {
                //Callback returned false, do nothing
                return;
            }    
        }

        //un-highlight in display list
        if (listItem.highlighted)
        {
            if (this.props.toggleHighlight)
                this.findInDisplay(listItem.name).highlighted = false;
        }
        else
        {
           
            if (this.state.searching)
            {
                //Add to display list if it doesn't already exist
                if (this.props.toggleHighlight)
                    listItem.highlighted = true;
                if (this.props.addToDisplayList)
                    searchItem.items.unshift(listItem);
            }
            else
            {
                 //Highligh in displayList
                 if (this.props.toggleHighlight)
                     this.findInDisplay(listItem.name).highlighted = true;
            }
        }

        //This cause a state update, which we do not ignore
        this.setState( { ...this.state, searching: false } );

    }

    endSearch()
    {

    }

    findInDisplay( name : string)
    {

        return this.getSelectedItem().items.find( ( subreddit : ListItem ) => { return subreddit.name.toLowerCase() == name.toLowerCase() } );
    }
}