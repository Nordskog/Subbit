import * as React from 'react';

import subscribeButton from 'assets/images/subscribe_button.svg'
import subscribeSubredditButton from 'assets/images/subscribe_subreddit_button.svg'
import subscribedPartialButton from 'assets/images/subscribed_partial_button.svg'

import * as models from '~/common/models';

import * as styles from 'css/author.scss'


import * as components from '~/client/components'

import config from 'root/config'
import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

import * as transitions from 'react-transition-group'

import { NavLink} from 'redux-first-router-link'
import { urls } from '~/common';
import * as  Toast from '~/client/toast';
import SubscriptionSubreddit from '~/common/models/data/SubscriptionSubreddit';


import * as actions from '~/client/actions'

interface Props
{
    author: models.data.AuthorEntry;
    solo : boolean;
    subreddit: string;
    postDisplay: models.PostDisplay;
    authenticated: boolean;
    subscribe(author: string, subreddits : string[] ): void;
    unsubscribe(sub: models.data.Subscription): void;
    addSubscriptionSubreddit(subscription : number, subreddit : string ): void;
    removeSubscriptionSubreddit(subscription : number, subreddit : string): void;
    fetchMorePosts(author : models.data.AuthorEntry, count : number): void;
    searchSubreddits( name : string) : Promise< string[] >;
    goToSubscriptions(): void;
}
interface State
{
    postsExpanded: boolean;
    subredditsExpanded: boolean;
}

export default class AuthorCell extends React.Component<Props, State>
{

    container : HTMLDivElement;

    constructor(props)
    {
        super(props);
        this.state = { postsExpanded : false, subredditsExpanded: false};

        this.handleSubscribeClick = this.handleSubscribeClick.bind(this);
        this.handleUnsubscribeClick = this.handleUnsubscribeClick.bind(this);
        this.expandSubreddits = this.expandSubreddits.bind(this);
        this.collapseSubreddits = this.collapseSubreddits.bind(this);

        this.handleAddSubredditClick = this.handleAddSubredditClick.bind(this);
        this.handleRemoveSubredditClick = this.handleRemoveSubredditClick.bind(this);
    }
    shouldComponentUpdate(nextProps : Readonly<Props>, newState : State, nextContext) : boolean
    {
        if (nextProps.author === this.props.author && 
            this.state.postsExpanded == newState.postsExpanded &&
            this.state.subredditsExpanded == newState.subredditsExpanded &&
            this.props.postDisplay == nextProps.postDisplay
        )
        {
            return false;
        }

        return true;
    }

    static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
    {
        if ( nextProps.author.subscription == null || ( nextProps.author.subscription.subscribed != null && !nextProps.author.subscription.subscribed ) )
        {
            return {  ...prevState, subredditsExpanded: false };
        }

        return null;
    }

    renderNoPostsMessage()
    {
        return <div className={styles.noPostsContainer}>No posts here</div>
    }

    renderPosts()
    {
        if (this.state.subredditsExpanded)
            return null;

        if (this.props.author.author.posts.length < 1)
        {
            return this.renderNoPostsMessage();
        }

       return <components.transitions.FadeResize key={'posts_container'}>
                <components.author.cells.Posts
                    posts={this.props.author.author.posts}
                    postDisplay={this.props.postDisplay}
                    canLoadMore={!this.props.author.end}
                    grabMorePosts={( () => this.props.fetchMorePosts(this.props.author, config.client.postFetchCount))}
                    scrollToAuthorTop={() => this.scrollToAuthorTop()}
                    displaySubreddit={this.props.subreddit == null}
                />
            </components.transitions.FadeResize>
    }

    scrollToAuthorTop()
    {

        //Scroll to top of component if top of window is below it
        if (this.container.getBoundingClientRect().top < 0)
        {
            let options = {
                behavior: "smooth" as ScrollBehavior,   //Casts necessary for some silly reason
                block: "start" as ScrollLogicalPosition, 
                inline: "nearest" as ScrollLogicalPosition
            };
    
            this.container.scrollIntoView(options);
        }
    }

    

    getSubreddit()
    {
        if (this.props.subreddit != null && this.props.solo)
        {
            return <div className={styles.subreddit}>in <a href={urls.getSubredditUrl(this.props.subreddit)}>r/<b>{this.props.subreddit}</b></a></div>
        }
    }

    render()
    {
        return <div className={ this.isSubscribed() ? styles.subscribedAuthor : styles.author} key = { this.props.author.author.name } ref={ (c) => {this.container = c}} >
            <transitions.TransitionGroup component={'div'} className={styles.authorHeader}>
                {this.getButton()}
                {this.getShowSubredditsButton()}
                {this.getAuthorLink()}
                {this.getSubreddit()}
            </transitions.TransitionGroup>

            <div>

            <transitions.TransitionGroup component={'div'}>
                {this.getSubscribedSubreddits()}
                <div/>
                {this.renderPosts()}
            </transitions.TransitionGroup>

            </div>

        </div>
    }

    getAuthorLink()
    {
        //If we are in a subreddit, we should link to the user in that subreddit.
        //If we are already displaying a single author, we should link to the author in all subreddits.
        let subreddit : string = this.props.subreddit;
        if (this.props.solo)
            subreddit = null;
            
        return <NavLink 
                    className={styles.nameContainer}
                    to={ { type: actions.types.Route.AUTHOR, payload: { author:this.props.author.author.name, subreddit: subreddit } }  }>
                    {this.props.author.author.name}
                </NavLink>
    }

    getSubscribedCount()
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



    getSubscribedSubreddits()
    {
        if ( this.isSubscribed() && this.state.subredditsExpanded)
        {
            let subSearch : components.tools.SearchList.SearchItem = {
                items: this.props.author.subscription.subreddits.map(
                    ( subreddit : models.data.SubscriptionSubreddit) => 
                    {
                        return {
                            name: subreddit.name,
                            highlighted: true
                        }
                    }
                ),
                search: async ( name : string ) => { return ( await this.props.searchSubreddits(name) ).map( name => { return { name: name } }  ) },
                prefix: "r/",
                searchPlaceholder: "Subreddit",
                emptyMessage: 'Subscribed in all subreddits',
                displayHighlight: true,
                toggleHighlight: true,
                addToDisplayList: true,
                onClick:  (item : components.tools.SearchList.ListItem) => 
                    { 
                        if (item.highlighted)
                        {
                            this.props.removeSubscriptionSubreddit(this.props.author.subscription.id, item.name);
                        }
                        else
                        {
                            if ( this.getSubscribedCount() >= 20 )
                            {
                                Toast.toast( Toast.ToastType.ERROR, 10000, "Author subreddit limit reached" );
                                return false;
                            }

                            this.props.addSubscriptionSubreddit(this.props.author.subscription.id, item.name);
                        }
                    }
            }

            return  <components.transitions.FadeResize key={'subs_container'}>
             <div className={styles.subscriptionsContainer}>
                <components.tools.SearchList.component
                            items={subSearch} 
                            />
            </div>

            </components.transitions.FadeResize>

        }

        return null;
    }

    isSubscribed() : boolean
    {
       return (this.props.author.subscription != null && ( this.props.author.subscription.subscribed == null || this.props.author.subscription.subscribed )   )
    }

    isSubscribedInSubreddit() : boolean 
    {
        //If we are subscribed to the user, but not in the currently selected subreddit
        if ( this.isSubscribed() && this.props.subreddit != null )
        {
            for ( let i = 0; i < this.props.author.subscription.subreddits.length; i++)
            {
                if (this.props.author.subscription.subreddits[i].name.toLowerCase() == this.props.subreddit.toLowerCase())
                {
                    return true;
                }

            }
            return  false;
        }

        return true;
    }

    isSubscribedAll() : boolean 
    {
        if (this.isSubscribed())
        {
            if (this.props.author.subscription.subreddits.length < 1)
            {
                return true;
            }
        }

        return false;

    }

    getButton()
    {
        if (this.isSubscribed())
        {
            if (this.isSubscribedAll())
            {
            
                //Full star, click unsubscribes all
                return this.getUnsubscribeButton(false);
            }
            else
            {
                if (this.isSubscribedInSubreddit())
                {
                    //Display full star with hole? Click unsubscribes all
                    
                    return this.getUnsubscribeButton(true);
                }
                else
                {
                    return this.getSubscribeSubredditButton();
                }
            }

        }
        else
        {
            return this.getSubscribeButton();
        }
    }

    getSubscribeButton()
    {
        //Heh
        let butt : JSX.Element = <div className={styles.subscriptionButtonContainer} onClick={this.handleSubscribeClick} >
                        <svg className={styles.subscribeButton} >
                            <use xlinkHref={subscribeButton}></use>
                        </svg>
                    </div>

        let text : string = "subscribe";
        if (this.props.subreddit != null)
            text = "subscribe in r/"+this.props.subreddit;

        return <components.tools.InfoPopup
                    trigger={butt}
                    text={text} />

       
    }

    getSubscribeSubredditButton()
    {
        //Heh
        let butt : JSX.Element =    <div className={styles.subscriptionButtonContainer} onClick={ () => this.handleAddSubredditClick(this.props.subreddit)} style={ { position:"relative" } } >
                                        <svg className={styles.unsubscribeButton} style={ { position:"absolute" } } >
                                            <use xlinkHref={subscribeSubredditButton}></use>
                                        </svg>
                                        <svg className={styles.subscribeButton} style={ { position:"absolute" } } >
                                            <use xlinkHref={subscribeButton}></use>
                                        </svg>
                                    </div>

        let text : string = "subscribe in r/"+this.props.subreddit;

        return <components.tools.InfoPopup
                    trigger={butt}
                    text={text} />
    }

    getShowSubredditsButton()
    {
        if ( this.isSubscribed() )
        {
            return <components.transitions.FadeHorizontalResize key={'show_subreddits_button'}>
                        <div className={styles.displaySubredditsButtonContainer} onClick={ () => {  this.state.subredditsExpanded ? this.collapseSubreddits() : this.expandSubreddits() } } >
                            <svg className={styles.displaySubredditsButton} >
                                <use xlinkHref={ this.state.subredditsExpanded ? collapse_caret : expand_caret}></use>
                            </svg>
                        </div>
                    </components.transitions.FadeHorizontalResize>
        }
    }

    getUnsubscribeButton( partialStar : boolean)
    {
        //Function remains the same, but apperance is slightly different
        //depending on whether the subscription is all subreddits or only one.
        let svgName = subscribeButton;
        if (partialStar)
        {
            svgName = subscribedPartialButton;
        }
        
        let butt : JSX.Element = <div className={styles.subscriptionButtonContainer} onClick={this.handleUnsubscribeClick} >
                    <svg className={styles.unsubscribeButton} >
                        <use xlinkHref={svgName}></use>
                    </svg>
                </div>
                
        let text : string = "unsubscribe"

        return <components.tools.InfoPopup
                    trigger={butt}
                    text={text} />

    }

    handleSubscribeClick()
    {
        if (!this.props.authenticated)
        {
            this.props.goToSubscriptions();
            return;
            //Forward to subs page, which asks user to log in.
        }

        let subreddits : string[] = [];
        
        //Not subscribed, but subscription populated
        if ( this.props.author.subscription != null)
        {
            //User is resubscribing without closing page, repopulate subscribed subreddits
            subreddits = this.props.author.subscription.subreddits.map( ( subreddit : models.data.SubscriptionSubreddit ) => subreddit.name );
        }

        if (this.props.subreddit != null)
        {
            //Add current subreddit if we are in one. 
            //TODO support multi subreddits
            subreddits.push(this.props.subreddit);
        }

        this.props.subscribe(this.props.author.author.name, subreddits); 
    }



    handleUnsubscribeClick()
    {
        this.props.unsubscribe(this.props.author.subscription);
    }

    handleAddSubredditClick(subreddit : string)
    {
        this.props.addSubscriptionSubreddit(this.props.author.subscription.id, subreddit);
    }

    handleRemoveSubredditClick(subreddit : string)
    {
        this.props.removeSubscriptionSubreddit(this.props.author.subscription.id, subreddit);
    }

    expandSubreddits()
    {
        //Update post details
        this.setState( { subredditsExpanded: true } );
    }

    collapseSubreddits()
    {
        this.setState( { subredditsExpanded: false } );
    }
}