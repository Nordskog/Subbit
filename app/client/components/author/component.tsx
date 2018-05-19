import * as React from 'react';
import { Link } from 'react-router-dom';

import * as cells  from '~/client/components/author/cells'

import subscribeButton from 'assets/images/subscribe_button.svg'

import * as models from '~/common/models';

import * as styles from 'css/author.scss'
import * as siteStyles from 'css/site.scss'

import * as components from '~/client/components'

import * as animations from 'css/animations.scss'

import 'css/author'
import * as config from '~/config'
import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'
import { Query } from 'wetland/dist/src/Query';

import * as transitions from 'react-transition-group'

interface Props
{
    author: models.data.AuthorEntry;
    subreddit: string;
    subscribe(author: string, subreddits : string[] ): void;
    unsubscribe(sub: models.data.Subscription): void;
    getPostDetails(authors : models.data.AuthorEntry[]): void;
    addSubscriptionSubreddit(subscription : number, subreddit : string ): void;
    removeSubscriptionSubreddit(subscription : number, subreddit : string): void;
    fetchMorePosts(author : models.data.AuthorEntry, count : number): void;
}
interface State
{
    postsExpanded: boolean;
    subredditsExpanded: boolean;
}

export default class AuthorCell extends React.Component<Props, State>
{
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
            this.state.subredditsExpanded == newState.subredditsExpanded
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

    renderPosts()
    {
        if (this.state.subredditsExpanded)
            return null;

       return <components.transitions.FadeResize key={'posts_container'}>
            <components.author.cells.Posts
                posts={this.props.author.author.posts}
                canLoadMore={!this.props.author.end}
                grabMorePosts={( () => this.props.fetchMorePosts(this.props.author, config.postFetchCount))}
            />
         </components.transitions.FadeResize>
    }

    isSubscribed() : boolean
    {
       return (this.props.author.subscription != null && ( this.props.author.subscription.subscribed == null || this.props.author.subscription.subscribed )   )
    }

    render()
    {
        return <div className={ this.isSubscribed() ? "author-subscribedAuthor" : "author-author"} key = { this.props.author.author.name } >
            <transitions.TransitionGroup component={'div'} className="author-authorHeader">
                {this.getButton()}
                {this.getShowSubredditsButton()}

                <div className="author-nameContainer">
                    <div> <a href={'author/'+this.props.author.author.name}> {this.props.author.author.name} </a>   </div>
                </div>
            
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
    getSubscribedSubreddits()
    {
        if ( this.isSubscribed() && this.state.subredditsExpanded)
        {

            return  <components.transitions.FadeResize key={'subs_container'}>
             <div className={styles.subscriptionsContainer}>
                <components.tools.subredditList.component
                            subreddits={this.props.author.subscription.subreddits.map
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
                                    if (subreddit.highlighted)
                                    {
                                        this.props.removeSubscriptionSubreddit(this.props.author.subscription.id, subreddit.name);
                                    }
                                    else
                                    {
                                        this.props.addSubscriptionSubreddit(this.props.author.subscription.id, subreddit.name);
                                    }
                                }}
                                toggleHighlight={true}
                                addToDisplayList={true}
                                />
            </div>

            </components.transitions.FadeResize>

        }

        return null;


    }

    

    getButton()
    {
        if (this.isSubscribed())
            return this.getUnsubscribeButton();
        else
            return this.getSubscribeButton();
    }

    getSubscribeButton()
    {
        return <div onClick={this.handleSubscribeClick} >
        <svg className="author-subscribeButton" >
            <use xlinkHref={subscribeButton}></use>
        </svg>
        </div>
       
    }

    getShowSubredditsButton()
    {
        if ( this.isSubscribed() )
        {
            return <components.transitions.FadeHorizontalResize key={'show_subreddits_button'}>
                        <div className="author-displaySubredditsButtonContainer" onClick={ () => {  this.state.subredditsExpanded ? this.collapseSubreddits() : this.expandSubreddits() } } >
                            <svg className="author-displaySubredditsButton" >
                                <use xlinkHref={ this.state.subredditsExpanded ? collapse_caret : expand_caret}></use>
                            </svg>
                        </div>
                    </components.transitions.FadeHorizontalResize>
        }
    }

    getUnsubscribeButton()
    {
        return <div onClick={this.handleUnsubscribeClick} >
                    <svg className="author-unsubscribeButton" >
                        <use xlinkHref={subscribeButton}></use>
                    </svg>
                </div>
    }

    handleSubscribeClick()
    {
        let subreddits : string[] = [];
        
        //Not subscribed, but subscription populated
        if ( this.props.author.subscription != null)
        {
            console.log("sub: ", this.props.author.subscription);

            //User is resubscribing without closing page, repopulate subscribed subreddits
            subreddits = this.props.author.subscription.subreddits.map( ( subreddit : models.data.SubscriptionSubreddit ) => subreddit.name );
        }

        console.log("Resulting subs:",subreddits);

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