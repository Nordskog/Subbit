import * as React from 'react';




import * as siteStyles from 'css/site.scss';
import * as styles from 'css/subredditList.scss';
import * as components from '~/client/components';

import SVGInline from "react-svg-inline";
import * as subscribeButton from 'assets/images/subscribe_button.svg';

import * as transitions from 'react-transition-group';

export interface ListItem
{
    name : string;
    alt? : string;
    highlighted : boolean;
    object?: any;   // Used specified
    prefix?: string;    // Override SearchItem
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
    search?( name : string) : SearchResult[] | Promise<SearchResult[]>;
    enterBeforeSearchResult?( name : string) : SearchResult ;
    searchPlaceholder? : string;
    onClick( item : ListItem ) : boolean | undefined;
    onAltClick?( item : ListItem ) : void;
    prefix: string;
    highlightMap?: Set<string>;
    delaySearch?: boolean;
    emptyMessage?: string;
    displayHighlight: boolean;
    toggleHighlight: boolean;
    addToDisplayList: boolean;
}

interface Props
{
    items: SearchItem[] | SearchItem;

    onClick?( item : ListItem ) : boolean | undefined;
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
    private lastInput : string = null;
    private lastSearchTrigger : number = null;
    private awaitingSearch : boolean = false;
    private inputTimeout = null;
    private container : HTMLDivElement;

    constructor(props)
    {
        super(props);

        // Input may be array of single item
        let items : SearchItem[];
        if (this.props.items instanceof Array)
            items = this.props.items;
        else
            items = [this.props.items];

        // Setup highlight map for each item.
        // This really doesn't need to be in state but eh
        items.forEach( ( item : SearchItem ) => 
        {
            item.delaySearch = item.delaySearch != null ? item.delaySearch : true;
            item.highlightMap = new Set<string>();
            item.items.forEach( ( listItem : ListItem ) => {  if (listItem.highlighted) { item.highlightMap.add(listItem.name.toLowerCase()); } } );
        });
        
        // Just select first if only one present
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

    public shouldComponentUpdate(nextProps : Props, nextState : State)
    {
        // We handle everything ourselves, so ignore updates from parent,
        // otherwise we end up with animation-confusing duplicate renders
        if (nextState !== this.state)
        {
            return true;
        }

        return false;
    }

    public render()
    {
        return <div className={styles.subredditsContainer} >
                    <div className={styles.searchContainer}>
                        <transitions.TransitionGroup >
                            {this.getSearchBoxes()}
                        </transitions.TransitionGroup>
                    </div>
                    <components.animations.AutoSize className={styles.itemContainer}>
                            {this.getListItems()}
                            {this.getEmptyListIndicator()}
                    </components.animations.AutoSize>
                </div>;
    }

    private getSearchBoxes()
    {
        let boxes = [];

        if (this.state.selectedItem == null)
        {
            this.state.items.forEach( (item : SearchItem, index : number) => 
            {
                if (item.search != null)
                {
                    boxes.push( this.getSearchBox(item, index) );
                }
            });
        }
        else
        {
            if (this.getSelectedItem().search != null)
            {
                // Push only the selected item
                boxes.push( this.getSearchBox( this.state.items[this.state.selectedItem], this.state.selectedItem) );
            }

        }

        return boxes;
    }

    private getSelectedItem()
    {
        let itemIndex = 0;
        if (this.state.selectedItem != null)
            itemIndex = this.state.selectedItem;

        return this.state.items[itemIndex];
    }

    private getSearchBox( item : SearchItem, index : number )
    {
       return   <components.transitions.FadeVerticalResize key={"Search_" + index}>
                    <input 
                        onFocus={() => this.selectMode(index)} 
                        onChange={ (evt) => this.handleInput( item, evt.target.value ) } 
                        onKeyPress={ (e :  React.KeyboardEvent<HTMLInputElement>) => {  this.handleEnter(e.which);  } }
                        type="text" 
                        placeholder={item.searchPlaceholder}
                        className={ siteStyles.inputContainer }/>
                </components.transitions.FadeVerticalResize>;
                                 
    }

    private selectMode( index : number)
    {
        this.setState( { ...this.state, selectedItem: index } );
    }

    private async handleEnter(keyCode : number)
    {
        if (keyCode === 13)
        {
            if ( this.awaitingSearch && this.lastInput != null )
            {
                // Search in progress, enter selects inptut text
                let item : SearchItem = this.getSelectedItem();

                if (item.enterBeforeSearchResult != null)
                {
                    let searchResult : SearchResult = await item.enterBeforeSearchResult(this.lastInput);
                    if (searchResult != null )
                    {
                        let listItem = {
                            name: searchResult.name,
                            alt: searchResult.alt,
                            object: searchResult.object,
                            highlighted: item.highlightMap.has( searchResult.name.toLowerCase() )
                        };

                        this.cancelSearchRequest();
                        this.handleClick(item, listItem, true);
                       
                    }
                    
                }

            }
            else if ( this.state.searching && this.state.searchedItems.length > 0 )
            {
                // Search finished, enter selects top item
                let item : SearchItem = this.getSelectedItem();
                let listItem = this.state.searchedItems[0];

                this.handleClick(item, listItem, true);
            }
        }
    }

    // Wait a bit after input end before sending request
    private handleInput( item : SearchItem, input : string)
    {
        // Any existing search requests will compare time to this and return.
        this.lastSearchTrigger = Date.now();

        this.lastInput = input;

        if (this.inputTimeout != null)
        {
            clearTimeout( this.inputTimeout );
            this.inputTimeout = null;
        }

        if (item.delaySearch)
        {
            this.awaitingSearch = true;

            this.inputTimeout = setTimeout(() => {

                this.inputTimeout = null;
    
                if (input.length < 1)
                {
                    this.awaitingSearch = false;
                    this.setState(
                        {
                        ...this.state,
                        searchedItems: [],
                        searching: false,
                        }
                    );
                }
                else
                {
                    if (this.awaitingSearch)
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
                    searching: false,
                    }
                );
            }
            else
            {
                this.search( item, input );

            }
        }
    }

    private cancelSearchRequest()
    {
        this.awaitingSearch = false;
    }

    private async search( item : SearchItem, name : string)
    {
        this.awaitingSearch = true;
        
        // Keep track of time request was sent so we only
        // act on requests that were fired last.
        // This is also updated when the user starts typing again.
        let startTime = Date.now();
        this.lastSearchTrigger = startTime;

        let searchResult : SearchResult[] = await item.search(name);

        if (startTime < this.lastSearchTrigger || !this.awaitingSearch )
            return;

        this.awaitingSearch = false;

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
                };
            } ) } );
    }

    private getListItems()
    {
        let selecteItem : SearchItem = this.getSelectedItem();

        if (this.state.searching)
        {
            return this.state.searchedItems.map( (subreddit) => 
                {
                    return this.getListItem( subreddit, selecteItem);
                } );
        }
        else
        {
            return selecteItem.items.map( (item)  => 
                {
                    return this.getListItem( item, selecteItem );
                } );
        }
    }


 
    private getListItem(listItem : ListItem, searchItem : SearchItem)
    {
        return <div className={ styles.subscriptionSubredditContainer } key={listItem.name}  onClick={ () => this.handleClick(searchItem, listItem, this.state.searching)}  >
                    <div className={ styles.subscriptionSubredditInnerContainer } >
                        {this.getIndicator(listItem)}
                        <div className={ styles.subscriptionSubreddit }>
                            {this.getPrefix(listItem,searchItem)}<b>{listItem.name}</b>
                        </div>
                    </div>
                    {this.getAltBox(listItem, searchItem)}
                </div>;
    } 

    private getPrefix(listItem : ListItem, searchItem : SearchItem)
    {
        if (listItem.prefix != null)
            return listItem.prefix;
        return searchItem.prefix;
    }

    private getAltBox(listItem : ListItem, searchItem : SearchItem)
    {
        if (listItem.alt != null)
        {
            return <div className={styles.altBox} onClick={ (event : React.MouseEvent<HTMLDivElement>) => this.handleAltClick(event, searchItem, listItem,) }>
                        {listItem.alt}
                    </div>;
        }
    }

    private getEmptyListIndicator()
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
                        </div>;
        }
    }

    private getIndicator(subreddit : ListItem)
    {
        let style = subreddit.highlighted ? styles.unsubscribeIndicator : styles.subscribeIndicator;
        if ( !this.getSelectedItem().displayHighlight  )
        {
            return null;
        }

        return <div className={ styles.indicatorContainer }>
                    <SVGInline className={style} svg={subscribeButton}/>
                </div>;
    }

    private handleAltClick( event : React.MouseEvent<HTMLDivElement>, searchItem: SearchItem, listItem : ListItem)
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

    private handleClick( searchItem: SearchItem, listItem : ListItem, itemIsSearchResult : boolean )
    {
        this.cancelSearchRequest();

        ////////////////////////////
        // Deal with callbacks
        ////////////////////////////

        if (this.props.onClick != null)
        {
            let callbackReturn : boolean = this.props.onClick( listItem );

            if (callbackReturn != null && !callbackReturn )
            {
                // Callback returned false, do nothing
                return;
            }
        }

        // This causes a prop update, which we ignore
        if (searchItem.onClick != null)
        {
            let callbackReturn : boolean = searchItem.onClick(  listItem );
            if (callbackReturn != null && !callbackReturn )
            {
                // Callback returned false, do nothing
                return;
            }    
        }

        ///////////////////////////
        // Update or add to list
        //////////////////////////

        // Get existing item in list if present
        let existingListItem = this.findInDisplay(listItem.name);

        if (existingListItem != null)
        {
            if (searchItem.toggleHighlight)
            {
                existingListItem.highlighted = !existingListItem.highlighted;
                listItem.highlighted = existingListItem.highlighted;
            }
        }
        else
        {
            if (searchItem.toggleHighlight)
            {
                // New item means toggle on
                listItem.highlighted = true;
            }
            
            if (itemIsSearchResult)
            {
                if (searchItem.addToDisplayList)
                {
                    listItem.highlighted = true;
                    searchItem.items.unshift(listItem);
                }
            }
        }


        ///////////////////////////////
        // Update highlight map
        ///////////////////////////////

        if (searchItem.toggleHighlight)
        {

            if (!listItem.highlighted)
            {
                searchItem.highlightMap.delete( listItem.name.toLowerCase());
            }
            else
            {
                searchItem.highlightMap.add( listItem.name.toLowerCase());
            }
        }

        // This cause a state update, which we do not ignore
        this.setState( { searching: false } );
    }

    private endSearch()
    {

    }

    private findInDisplay( name : string)
    {
        return this.getSelectedItem().items.find( ( subreddit : ListItem ) =>  subreddit.name.toLowerCase() === name.toLowerCase() );
    }
}
