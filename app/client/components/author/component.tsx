import * as React from 'react';
import { Link } from 'react-router-dom';

import * as cells  from '~/client/components/author/cells'

import subscribeButton from 'assets/images/subscribe_button.svg'

import * as models from '~/common/models';

import 'css/author'
import * as config from '~/config'
import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'
import { Query } from 'wetland/dist/src/Query';

interface Props
{
    author: models.data.AuthorEntry;
    subscribe(author: string): void;
    unsubscribe(sub: models.data.Subscription): void;
    getPostDetails(authors : models.data.AuthorEntry[]): void;
    addSubscriptionSubreddit(subscriptionId : number, subredditId : number ): void;
    removeSubscriptionSubreddit(subscriptionId : number, subredditId : number): void;
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
        this.state = { postsExpanded : false, subredditsExpanded: false };

        this.handleSubscribeClick = this.handleSubscribeClick.bind(this);
        this.handleUnsubscribeClick = this.handleUnsubscribeClick.bind(this);
        this.collapsePosts = this.collapsePosts.bind(this);
        this.expandPosts = this.expandPosts.bind(this);
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

    canExpand() : boolean
    {
        if (!this.state.postsExpanded)
        {
            if (this.props.author.author.posts.length > config.postDisplayCount)
                return true;
        }
        else
        {
            return false;
        }
    }

    canLoadMore() : boolean
    {
        return !this.props.author.end;
    }

    renderPosts()
    {
        let renderedPosts = [];
        let limit = config.postDisplayCount;
        let remaining = this.props.author.author.posts.length - limit;

        for (let [index, post] of this.props.author.author.posts.entries())
        {
            if (!this.state.postsExpanded && (index >= limit) )
            {
                break;
            }
            else
            {
                renderedPosts.push( <cells.postCell
                    key={post.id}
                    post={post}
                    isTopPost={index==0}
                /> );
            }
        };

        if (this.canExpand() || this.canLoadMore())
        {
            renderedPosts.push (this.getExpandButton() );
        }

        if ( this.state.postsExpanded)
        {
            renderedPosts.push(this.getCollapseButton());
        }

        return renderedPosts;

    }

    render()
    {
        return <div className={this.props.author.subscription ? "author-subscribedAuthor" : "author-author"} key = { this.props.author.author.name } >
            <div className="author-authorHeader">
                {this.getButton()}
                {this.getShowSubredditsButton()}
                <div className="author-nameContainer">
                    <div> <a href={'author/'+this.props.author.author.name}> {this.props.author.author.name} </a>   </div>
                </div>
               
            </div>
            {this.getSubscribedSubreddits()}
            
            
            <div className="author-posts">
            {
                this.renderPosts()
            }
                </div>
        </div> ;
    }

    getSubscribedSubreddits()
    {
        if (this.props.author.subscription != null && this.state.subredditsExpanded)
            return <cells.redditsCell subreddits={this.props.author.subscription.subreddits} 
                                 addSubscriptionSubreddit={this.handleAddSubredditClick}
                                 removeSubscriptionSubreddit={this.handleRemoveSubredditClick}
            />
        else
            return <div/>
    }

    getButton()
    {
        if (this.props.author.subscription)
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
        if (this.props.author.subscription != null)
        {
            return <div className="author-displaySubredditsButtonContainer" onClick={ this.state.subredditsExpanded ? this.collapseSubreddits : this.expandSubreddits}>
            <svg className="author-displaySubredditsButton" >
                <use xlinkHref={ this.state.subredditsExpanded ? collapse_caret : expand_caret}></use>
            </svg>
        </div>
        }
        else
        {
            return;
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

    getExpandButton()
    {
        return <div className="author-morePostsContainer" key={"_expandButton"} onClick={this.expandPosts} > 
                <div className="author-morePostsInnerContainer">
                    <svg className="author-morePostsButton" >
                        <use xlinkHref={expand_caret}></use>
                    </svg>
                </div>

                <span>More posts</span>
        </div>
    }

    getCollapseButton()
    {
        return <div className="author-morePostsContainer" key={"_collapsebutton"} onClick={this.collapsePosts} >
            <div className="author-morePostsInnerContainer"> 
                <svg className="author-morePostsButton" >
                    <use xlinkHref={collapse_caret}></use>
                </svg>
            </div>
        </div>
    }

    handleSubscribeClick()
    {
        this.props.subscribe(this.props.author.author.name);
    }

    handleUnsubscribeClick()
    {
        this.props.unsubscribe(this.props.author.subscription);
    }

    handleAddSubredditClick(subredditId : number)
    {
        this.props.addSubscriptionSubreddit(this.props.author.subscription.id, subredditId);
    }

    handleRemoveSubredditClick(subredditId : number)
    {
        this.props.removeSubscriptionSubreddit(this.props.author.subscription.id, subredditId);
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


    expandPosts()
    {
        if (this.state.postsExpanded)
        {
            let offset : number = this.props.author.author.posts.length;
            let count : number = config.postFetchCount;
            this.props.fetchMorePosts(this.props.author, count);
        }
        else
        {
            //Just expanding, grab more if necessary
            if (this.props.author.author.posts.length <= config.postDisplayCount)
            {
                this.grabMorePosts();
            }
            this.props.getPostDetails( [this.props.author] );
            this.setState( { postsExpanded: true } );
        }
    }

    grabMorePosts()
    {
        let offset : number = this.props.author.author.posts.length;
        let count : number = config.postFetchCount;
        this.props.fetchMorePosts(this.props.author, count);
    }

    collapsePosts()
    {
        this.setState( { postsExpanded: false } );
    }
}