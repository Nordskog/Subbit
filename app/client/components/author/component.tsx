import * as React from 'react';



import * as models from '~/common/models';

import * as styles from 'css/author.scss';


import * as components from '~/client/components';

import config from 'root/config';

import SVGInline from "react-svg-inline";
import * as subscribeButton from 'assets/images/subscribe_button.svg';
import * as subscribeSubredditButton from 'assets/images/subscribe_subreddit_button.svg';
import * as subscribedPartialButton from 'assets/images/subscribed_partial_button.svg';
import * as expand_caret from 'assets/images/expand_caret.svg';
import * as collapse_caret from 'assets/images/collapse_caret.svg';
import * as loading_caret from 'assets/images/loading_caret.svg';

import * as transitions from 'react-transition-group';

import { NavLink } from 'redux-first-router-link';
import { urls, tools } from '~/common';
import * as  Toast from '~/client/toast';
import SubscriptionSubreddit from '~/common/models/data/SubscriptionSubreddit';


import * as actions from '~/client/actions';
import { Subscription } from '~/common/models/data';

enum SubscriptionState
{
    UNSUBSCRIBED, SUBSCRIBED_ALL, SUBSCRIBED_PARTIAL, SUBSCRIBED_NOT_SUBREDDIT
}

interface Props
{
    author: models.data.AuthorEntry;
    solo : boolean;
    subreddit: string;
    filter: models.AuthorFilter;
    postDisplay: models.PostDisplay;
    authenticated: boolean;
    subscribe(author: string, subreddits : string[] ): void;
    unsubscribe(sub: models.data.Subscription): void;
    addSubscriptionSubreddit(subscription : Subscription, subreddit : string ): void;
    removeSubscriptionSubreddit(subscription : Subscription, subreddit : string): void;
    fetchPosts(author : models.data.AuthorEntry, count : number): void;
    fetchMorePosts(author : models.data.AuthorEntry, count : number): void;
    searchSubreddits( name : string) : Promise< string[] >;
    goToSubscriptions(): void;
}
interface State
{
    subscriptionsModified: boolean;   // Set to false on subs opened, checke on return to posts
    awaitingPosts: boolean;           // Returning from subscriptions, do not display until new props arrive
    postsExpanded: boolean;
    subredditsExpanded: boolean;
    prevProps : Props;  // Sigh.
}

export default class AuthorCell extends React.Component<Props, State>
{

    private container : HTMLDivElement;

    constructor(props)
    {
        super(props);
        this.state = { postsExpanded : false, subredditsExpanded: false, subscriptionsModified: false, awaitingPosts : false, prevProps: props };
    }

    public shouldComponentUpdate(nextProps : Readonly<Props>, newState : State, nextContext) : boolean
    {
        if (nextProps.author === this.props.author && 
            this.state.postsExpanded === newState.postsExpanded &&
            this.state.subredditsExpanded === newState.subredditsExpanded &&
            this.props.postDisplay === nextProps.postDisplay &&
            this.state.awaitingPosts === newState.awaitingPosts
        )
        {
            return false;
        }

        return true;
    }

    // React devs are retarded and changed this to also be called when state changes,
    // so we have to store a copy of props and compare it to prev to tell if it was actually props that changed.

    public static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
    {
        // Props unchanged, it was just the state that changed.
        if (nextProps === prevState.prevProps)
            return null;

        // If managing subscriptions and subscription was removed, or subscriptions were modified
        // and we returned to posts, but are awaiting updated posts.
        if  (( ( prevState.subredditsExpanded && ( nextProps.author.subscription.subscribed != null && !nextProps.author.subscription.subscribed ) )
             ||
             ( prevState.awaitingPosts )
            ))
        {

            return {  ...prevState, subredditsExpanded: false, awaitingPosts: false, subscriptionsModified: false, prevProps : nextProps };
        }

        return { ...prevState, prevProps: nextProps };
    }

    private renderNoPostsMessage()
    {
        return  <components.transitions.FadeVerticalResize key={'no_posts_container'} className={styles.noPostsContainer}>
                    <div className={styles.noPostsContainerInner}>No posts here</div>
                </components.transitions.FadeVerticalResize>;
    }

    private renderPosts()
    {
        if (this.state.subredditsExpanded)
            return null;

        if (this.props.author.author.posts.length < 1)
        {
            return this.renderNoPostsMessage();
        }

       return <components.transitions.FadeVerticalResize key={'posts_container'}>
                <components.author.cells.Posts
                    posts={this.props.author.author.posts}
                    postDisplay={this.props.postDisplay}
                    canLoadMore={!this.props.author.end}
                    grabMorePosts={( () => this.props.fetchMorePosts(this.props.author, config.client.postFetchCount))}
                    scrollToAuthorTop={() => this.scrollToAuthorTop()}
                    displaySubreddit={this.props.subreddit == null}
                />
            </components.transitions.FadeVerticalResize>;
    }

    private scrollToAuthorTop()
    {

        // Scroll to top of component if top of window is below it
        if (this.container.getBoundingClientRect().top < 0)
        {
            let options = {
                behavior: "smooth" as ScrollBehavior,   // Casts necessary for some silly reason
                block: "start" as ScrollLogicalPosition, 
                inline: "nearest" as ScrollLogicalPosition
            };
    
            this.container.scrollIntoView(options);
        }
    }

    public render()
    {
        return <div className={ this.isSubscribed(this.props.author.subscription) ? styles.subscribedAuthor : styles.author} key = { this.props.author.author.name } ref={ (c) => {this.container = c;}} >
            <transitions.TransitionGroup component={'div'} className={styles.authorHeader}>
                {this.getButton()}
                {this.getShowSubredditsButton()}
                {this.getAuthorLink()}
                {this.getSubredditLink()}
            </transitions.TransitionGroup>

            <div>

            <transitions.TransitionGroup component={'div'}>
                {this.getSubscribedSubreddits()}
                {this.getTransitionGroupWorkaround()}
                {this.renderPosts()}
                {this.renderAwaitingCover()}
                
            </transitions.TransitionGroup>

            </div>

        </div>;
    }

    public getTransitionGroupWorkaround()
    {
        // Transition groups are bugged in certain situations. This fixes it, for some reason.
        return <div/>;
    }

    public renderAwaitingCover()
    {
        if (this.state.awaitingPosts)
        {
            return  <components.transitions.Fade key={'awaiting_cover'}>
            <div className={styles.authorWaitingCover} />

           </components.transitions.Fade>;
        }

    }

    public getSubredditLink()
    {
        if (this.props.subreddit != null && this.props.solo)
        {
            return <div className={styles.subreddit}>
            in 
            <NavLink 
                to={ { type: actions.types.Route.SUBREDDIT, payload: { subreddit: this.props.subreddit } }  }>
                r/<b>{this.props.subreddit}</b>
            </NavLink>
            </div>;
        }
    }

    public getAuthorLink()
    {
        // If we are in a subreddit, we should link to the user in that subreddit.
        // If we are already displaying a single author, we should link to the author in all subreddits.
        let subreddit : string = this.props.subreddit;
        if (this.props.solo)
            subreddit = null;
            
        return <NavLink 
                    className={styles.nameContainer}
                    to={ { type: actions.types.Route.AUTHOR, payload: { author: this.props.author.author.name, subreddit: subreddit } }  }>
                    {this.props.author.author.name}
                </NavLink>;
    }

    public getSubscribedCount()
    {
        let subCount : number = 0;
        if (this.props.author.subscription != null && this.props.author.subscription.subscribed)
        {
            this.props.author.subscription.subreddits.forEach( (sub :  SubscriptionSubreddit ) => 
            {
                if (sub.subscribed)
                    subCount++;
            } );
        }

        return subCount;
    }



    public getSubscribedSubreddits()
    {
        if ( this.isSubscribed(this.props.author.subscription) && this.state.subredditsExpanded)
        {
            let subSearch : components.tools.SearchList.SearchItem = {
                items: this.props.author.subscription.subreddits.map(
                    ( subreddit : models.data.SubscriptionSubreddit) => 
                    {
                        return {
                            name: subreddit.name,
                            highlighted: true
                        };
                    }
                ),
                search: async ( name : string ) => ( await this.props.searchSubreddits(name) ).map( (name) => ({ name: name }) ),
                enterBeforeSearchResult: ( name : string ) => 
                { 
                    name = tools.string.sanitizeAlphaNumericDashUnderscore(name);
                    return  { 
                        name: name.trim() 
                    }; 
                },
                prefix: "r/",
                searchPlaceholder: "Subreddit",
                emptyMessage: 'Subscribed in all subreddits',
                displayHighlight: true,
                toggleHighlight: true,
                addToDisplayList: true,
                onSelect:  (item : components.tools.SearchList.ListItem) => 
                    { 
                        if (item.highlighted)
                        {
                            this.setState( { subscriptionsModified: true } );
                            this.props.removeSubscriptionSubreddit(this.props.author.subscription, item.name);
                        }
                        else
                        {
                            if ( this.getSubscribedCount() >= 20 )
                            {
                                Toast.toast( Toast.ToastType.ERROR, 10000, "Author subreddit limit reached" );
                                return false;
                            }

                            this.setState( { subscriptionsModified: true } );
                            this.props.addSubscriptionSubreddit(this.props.author.subscription, item.name);
                        }
                    }
            };

            return  <components.transitions.FadeVerticalResize key={'subs_container'}>
             <div className={styles.subscriptionsContainer}>
                <components.tools.SearchList.component
                            items={subSearch} 
                            />
            </div>

            </components.transitions.FadeVerticalResize>;

        }

        return null;
    }

    public isSubscribed( sub : Subscription ) : boolean
    {
       return (sub != null && ( sub.subscribed == null || sub.subscribed )   );
    }

    public isSubscribedInSubreddit( sub : Subscription ) : boolean 
    {
        // If we are subscribed to the user, but not in the currently selected subreddit
        if ( this.isSubscribed( sub ) && this.props.subreddit != null )
        {
            for (let subreddit of sub.subreddits)
            {
                if (subreddit.name.toLowerCase() === this.props.subreddit.toLowerCase())
                {
                    return true;
                }
            }

            return  false;
        }

        return true;
    }

    public isSubscribedAll( sub : Subscription ) : boolean 
    {
        if ( this.isSubscribed( sub ) )
        {
            if (sub.subreddits.length < 1)
            {
                return true;
            }
        }

        return false;

    }

    public getSubscriptionState( sub : Subscription) : SubscriptionState
    {
        if (this.isSubscribed(sub))
        {
            if (this.isSubscribedAll(sub))
            {
            
                // Full star, click unsubscribes all
                return SubscriptionState.SUBSCRIBED_ALL;
            }
            else
            {
                if (this.isSubscribedInSubreddit(sub))
                {
                    // Display full star with hole? Click unsubscribes all
                    return SubscriptionState.SUBSCRIBED_PARTIAL;
                }
                else
                {
                    return SubscriptionState.SUBSCRIBED_NOT_SUBREDDIT;
                }
            }
        }
        else
        {
            return SubscriptionState.UNSUBSCRIBED;
        }
    }

    public getButton()
    {
        let subState : SubscriptionState = this.getSubscriptionState( this.props.author.subscription );

        switch(subState)
        {
            case SubscriptionState.UNSUBSCRIBED:
                return this.getSubscribeButton();
            case SubscriptionState.SUBSCRIBED_ALL:
                return this.getUnsubscribeButton(false);
            case SubscriptionState.SUBSCRIBED_PARTIAL:
                return this.getUnsubscribeButton(true);
            case SubscriptionState.SUBSCRIBED_NOT_SUBREDDIT:
                return this.getSubscribeSubredditButton();
        }
    }

    public getSubscribeButton()
    {
        // Heh
        let butt : JSX.Element = <div key={"subscribe_button"} className={styles.subscriptionButtonContainer} onClick={ () => this.handleSubscribeClick()} >
                                    <div className={styles.subscribeButton} >
                                        <SVGInline svg={subscribeButton}/>
                                    </div>
                                </div>;

        let text : string = "subscribe";
        if (this.props.subreddit != null)
            text = "subscribe in r/" + this.props.subreddit;

            
            
        return <components.tools.InfoPopup
                    trigger={butt}
                    text={text} />; 
    }

    public getSubscribeSubredditButton()
    {
        // Heh
        let butt : JSX.Element = <div key={"subscribe_subreddit_button"} className={styles.subscriptionButtonContainer} onClick={ () => this.handleAddSubredditClick(this.props.subreddit)} style={ { position: "relative" } } >
                                    <div className={styles.subscriptionButtonOverlapContainer}>
                                        <div className={styles.subscriptionButton} style={ { position: "absolute" } }>
                                            <SVGInline  className={styles.unsubscribeButton} svg={subscribeSubredditButton}/>
                                        </div>
                                        <div className={styles.subscriptionButton} style={ { position: "absolute" } }>
                                            <SVGInline  className={styles.subscribeButton} svg={subscribeButton}/>
                                        </div>
                                    </div>
                                </div>;

        let text : string = "subscribe in r/" + this.props.subreddit;

        return <components.tools.InfoPopup
                    trigger={butt}
                    text={text} />;
    }

    public getUnsubscribeButton( partialStar : boolean)
    {
        // Function remains the same, but apperance is slightly different
        // depending on whether the subscription is all subreddits or only one.
        let icon = subscribeButton;
        let key = "unsubscribe_subscription_button";
        if (partialStar)
        {
            icon = subscribedPartialButton;
            key = "unsubscribe_partial_subscription_button";
        }
        
        // The key has to go on the svg rather than the outer element for chrome to treat everything as a new element.
        // I don't know why.
        let butt : JSX.Element = <div className={styles.subscriptionButtonContainer} onClick={ () => this.handleUnsubscribeClick()} >
                                    <SVGInline className={styles.unsubscribeButton} key={key} svg={icon}/>
                                </div>;
                
        let text : string = "unsubscribe";

            

        return <components.tools.InfoPopup
                    trigger={butt}
                    text={text} />;
    }


    public getShowSubredditsButton()
    {
        let subState : SubscriptionState = this.getSubscriptionState( this.props.author.subscription );
        let visible = subState !== SubscriptionState.UNSUBSCRIBED;
        let temporary = visible && this.props.author.subscription.id == null;  // Sub created but haven't received reply from server yet. Disable click.

        if ( visible )
        {
            // Note that all components have the same outer key, but the inner key is different.
            // This is because chrome will not render svgs with dynamic hrefs.
            // We still want transitions to treat them all the same, so we give the container the same key,
            // and make react treat them as different instances by changing the inner key.
            // Later: SVGs are now inlined so this probably doesn't matter.
            if (this.state.awaitingPosts)
            {
                return <components.transitions.FadeHorizontalResize key={'show_subreddits_button'}>
                            <div className={styles.displaySubredditsButtonContainer} >
                                <SVGInline key={"awaiting_posts"} className={styles.loadingPostsIndicator} svg={loading_caret}/>
                            </div>
                        </components.transitions.FadeHorizontalResize>;
            }
            else 
            {
                let icon;
                let key;
                if (this.state.subredditsExpanded)
                {
                    icon = collapse_caret;
                    key = "collapse_posts";
                }
                else
                {
                    icon = expand_caret;
                    key = "expand_posts";
                }
                
                return <components.transitions.FadeHorizontalResize key={'show_subreddits_button'}>
                            <div  className={styles.displaySubredditsButtonContainer} onClick={ temporary ? null : () => { this.handleManageSubscriptionsClick(); } } >
                                <SVGInline key={key} className={styles.displaySubredditsButton} svg={icon}/>
                            </div>
                        </components.transitions.FadeHorizontalResize>;
            }
        }
    }

    ////////////////////////////
    // Star click handlers
    ////////////////////////////

    public handleManageSubscriptionsClick()
    {
        // Waiting for posts or sub info from server.
        if (this.state.awaitingPosts ) 
        {
            return;
        }

        // Collapse
        if (this.state.subredditsExpanded)
        {
            // Request updated posts if we are viewing subscriptions and have made changes.
            // Set posts awaiting to prevent return until new posts have been loaded.
            if (this.state.subscriptionsModified && ( this.props.filter === models.AuthorFilter.SUBSCRIPTIONS || this.props.filter === models.AuthorFilter.IMPORTED ) )
            {
                this.props.fetchPosts(this.props.author, config.client.postFetchCount);
                this.setState( { subredditsExpanded: true, subscriptionsModified: false, awaitingPosts: true } );
            }
            else
            {
                this.setState( { subredditsExpanded: false, subscriptionsModified: false } );
            }        
        }
        else // Expand
        {
            // Reset modified bool to false
            this.setState( { subredditsExpanded: true, subscriptionsModified: false } );
        }
    }



    public handleSubscribeClick()
    {
        if (!this.props.authenticated)
        {
            this.props.goToSubscriptions();
            return;
            // Forward to subs page, which asks user to log in.
        }

        let subreddits : string[] = [];
        
        // Not subscribed, but subscription populated
        if ( this.props.author.subscription != null)
        {
            // User is resubscribing without closing page, repopulate subscribed subreddits
            subreddits = this.props.author.subscription.subreddits.map( ( subreddit : models.data.SubscriptionSubreddit ) => subreddit.name );
        }

        if (this.props.subreddit != null)
        {
            // Add current subreddit if we are in one. 
            // TODO support multi subreddits
            subreddits.push(this.props.subreddit);
        }

        this.props.subscribe(this.props.author.author.name, subreddits); 
    }

    public handleUnsubscribeClick()
    {
        // Subscription is temporary while await response from server, cannot be mofidied yet.
        if (this.props.author.subscription.id == null)
            return;

        this.props.unsubscribe(this.props.author.subscription);

        // Close subreddits panel if open
        if (this.state.subredditsExpanded)
        {
            // Will not fetch posts.
            this.setState( { subredditsExpanded: false, subscriptionsModified: false } );
        }
    }

    // This is used when clicking the star.
    // Adding/removing in the manage subreddits panel calls props function directly.
    public handleAddSubredditClick(subreddit : string)
    {
        this.props.addSubscriptionSubreddit(this.props.author.subscription, subreddit);
        // Close subreddits panel if open
        if (this.state.subredditsExpanded)
        {
            // Will not fetch posts.
            this.setState( { subredditsExpanded: false, subscriptionsModified: false } );
        }
    }

}
