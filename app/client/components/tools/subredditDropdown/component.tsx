import * as React from 'react';

import * as models from '~/common/models';

import SVGInline from "react-svg-inline";

import * as expand_caret from 'assets/images/expand_caret.svg';

 import { Popup } from '~/client/components/tools';

import * as SearchList from '~/client/components/tools/SearchList';

import * as styles from "css/redditlist.scss";
import { Post } from '~/common/models/reddit';

import * as actions from '~/client/actions';

import MediaQuery from 'react-responsive';
import { tools } from '~/common';
import { NavLink } from 'redux-first-router-link';

interface Props
{
    subscriptions : models.data.Subscription[];
    subreddit : string;
    changeSubreddit( subreddit : string ) : void; 
    viewAuthor( author : string, subreddit? : string) : void;
    filter : models.AuthorFilter;
    searchSubreddit( name : string) : Promise< string[] >;
    searchPosts(subreddit : string, query : string ): Promise<Post[]>;
}

interface State
{
    subreddits : SearchList.ListItem[];
}


export default class SubredditDropdown extends React.Component<Props, State>
{
    public state = { subreddits: []};
    
    public static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
    {
        let subreddits: SearchList.ListItem[]  = [];

        // Also add all subreddits from subscriptions
        {
            let subMap : Map<string, string> = new Map<string, string>();
            nextProps.subscriptions.forEach( (sub : models.data.Subscription) => 
            {
                sub.subreddits.forEach( ( subred : models.data.SubscriptionSubreddit ) => 
                {
                    subMap.set(subred.name.toLowerCase(), subred.name);
                });
            });
            subMap.forEach( (name : string) => subreddits.push( { name: name, highlighted: false, object: name } ) );
        }

            subreddits.unshift( { name: "All", highlighted: false, object: "All"});
            subreddits.unshift( { name: "Frontpage", highlighted: false, object: null, prefix: ""});  // object null since home is no subreddit

        // We will also add two dummy items. ALL And HOME (frontpage);
        // The latter is checked for and passed to changeSubreddit as null

        return  { subreddits: subreddits };
    }

    constructor(props)
    {
        super(props);

    }

    public render()
    {
        return this.getSubredditsPopup( this.getButton() );

    }

    private getButton()
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

    </div>;
    }

    private getCurrentSubreddit()
    {
        if (this.props.subreddit != null)
        {
            return <span>r/<b>{this.props.subreddit}</b></span>;
        }
        return <b>Frontpage</b>;
    }

    private getSubredditsPopup( trigger : JSX.Element ) : JSX.Element
    {
        let searches : SearchList.SearchItem[] = [];

        /////////////////////////
        // Subreddits
        /////////////////////////

        let subSearch : SearchList.SearchItem = {
            toggleHighlight: false,
            displayHighlight : false,
            addToDisplayList : false,
            items: this.state.subreddits,
            search: async ( name : string ) => ( await this.props.searchSubreddit(name) ).map( (name) => ({ name: name, object: name })  ),
            enterBeforeSearchResult: ( name : string ) => 
            {
                name = tools.string.sanitizeAlphaNumericDashUnderscore(name);

                return { 
                     name: name.trim(), 
                     object: name.trim() 
                }; 
            },
            prefix: "r/",
            searchPlaceholder: "Subreddit",
            onSelect: ( item : SearchList.ListItem, source : SearchList.EventSource) => 
            {
                // Replacing items with link components, only handle select if enter
                if ( source === SearchList.EventSource.ENTER )
                {
                    this.props.changeSubreddit(item.object); 
                    return true; 
                }

                return true; 
            },
            itemComponent: ( item : SearchList.ListItem, containerStyle : string  ) =>
            {                
                 // Frontpage item will have null object instead of name
                if (item.object == null)
                {
                    return   <NavLink className={ containerStyle }                     
                                to={ { type: actions.types.Route.HOME, payload: { } as actions.types.Route.HOME } } >
                                <b>{item.name}</b>
                            </NavLink>; 
                }
                else 
                {
                    return   <NavLink className={ containerStyle }
                                to={  { type: actions.types.Route.SUBREDDIT, payload: { subreddit: item.object } as actions.types.Route.SUBREDDIT } }>
                                r/<b>{item.name}</b>
                            </NavLink>; 
                }
            }
        };

        searches.push(subSearch);

        ////////////////////////////
        // Authors
        ////////////////////////////

        let authorSearch : SearchList.SearchItem = {

            items: this.props.subscriptions.map(
                ( sub : models.data.Subscription) => 
                {
                    return {
                        name: sub.author,
                        highlighted: true,
                        alt: this.props.subreddit != null ? this.props.subreddit : null
                    };
                }
            ),
            
            search: ( name : string ) => 
            { 
                name = tools.string.sanitizeAlphaNumericDashUnderscore(name);
                return [{name: name, alt: this.props.subreddit != null ? this.props.subreddit : null}]; 
            },   // Can't search for users :(
            prefix: "",
            searchPlaceholder: "Author",
            displayHighlight: true,
            toggleHighlight : false,
            addToDisplayList : false,
            delaySearch : false,
            onSelect: ( item : SearchList.ListItem, source : SearchList.EventSource) => 
            {
                // Replacing items with link components, only handle select if enter
                if ( source === SearchList.EventSource.ENTER )
                {
                    this.props.viewAuthor(item.name); 
                }
                return true; 
            },
            itemComponent: ( item : SearchList.ListItem, containerStyle : string  ) =>
            {                
               return   <NavLink className={ containerStyle }
                            to={ { type: actions.types.Route.AUTHOR, payload: { author: item.name } as actions.types.Route.AUTHOR } }>
                            <b>{item.name}</b>
                        </NavLink>; 
            },
            altComponent: ( item : SearchList.ListItem, containerStyle : string  ) =>
            {                
               return   <NavLink className={ containerStyle }
                            to={ { type: actions.types.Route.AUTHOR, payload: { author: item.name, subreddit: item.alt } as actions.types.Route.AUTHOR } }>
                            in r/{item.alt}
                        </NavLink>; 
            }
        };

        searches.push(authorSearch);

        ////////////////////////////
        // Posts
        ////////////////////////////

        if (this.props.subreddit != null && this.props.subreddit !== "All")  // No point in searching all
        {
            let postSearch : SearchList.SearchItem = {

                items: [],
                search: async ( query : string ) => 
                    { 
                        return ( await this.props.searchPosts(this.props.subreddit, query) ).map( (post) => 
                            { 
                                return { name: post.title, object: post.author, alt: post.author }; 
                            }); 
                    },
                prefix: "",
                searchPlaceholder: "Post",
                displayHighlight: false,
                toggleHighlight : false,
                addToDisplayList : false,
                delaySearch : true,
                onSelect: ( item : SearchList.ListItem, source : SearchList.EventSource) => 
                {
                    // Replacing items with link components, only handle select if enter
                    if ( source === SearchList.EventSource.ENTER )
                    {
                        this.props.viewAuthor(item.object, this.props.subreddit);
                    }

                    return true; 
                },
                itemComponent: ( item : SearchList.ListItem, containerStyle : string  ) =>
                {                
                   return   <NavLink className={ containerStyle }
                                to={ { type: actions.types.Route.AUTHOR, payload: { author: item.alt, subreddit: this.props.subreddit } as actions.types.Route.AUTHOR } }>
                                <b>{item.name}</b>
                            </NavLink>; 
                },
                altComponent: ( item : SearchList.ListItem, containerStyle : string  ) =>
                {                
                    return   <NavLink className={ containerStyle }
                                to={ { type: actions.types.Route.AUTHOR, payload: { author: item.alt, subreddit: this.props.subreddit } as actions.types.Route.AUTHOR } }>
                                <b>{item.alt}</b>
                            </NavLink>; 
                }
            };

            searches.push(postSearch);
        }


        return <MediaQuery query="screen and (max-width: 1100px)">
        {
            (matches : boolean) => 
            {
                if (matches)
                {
                    return <SearchList.popup
                    modal={true}
                    trigger={ trigger }
                    items={searches}
                    position={Popup.Position.BOTTOM}
                    alignment={Popup.Alignment.BEGINNING}
                    />;
                }
                else
                {
                    return <SearchList.popup
                    modal={false}
                    trigger={ trigger }
                    items={searches}
                    position={Popup.Position.BOTTOM}
                    alignment={Popup.Alignment.BEGINNING}
                    />;
                }
            } 
        }
        </MediaQuery>;


    }

    private getExpandCaret()
    {
        return  <SVGInline className={styles.expandButton} svg={expand_caret}/>;
    
    }
}
