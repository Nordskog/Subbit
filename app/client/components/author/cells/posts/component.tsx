import * as React from 'react';


import * as models from '~/common/models';

import config from 'root/config';

import * as cells from './cells';

import * as authorStyles from 'css/author.scss';

import SVGInline from "react-svg-inline";
import * as expand_caret from 'assets/images/expand_caret.svg';
import * as collapse_caret from 'assets/images/collapse_caret.svg';

import * as components from '~/client/components';

import * as transitions from 'react-transition-group';

interface Props
{
    posts: models.reddit.Post[];
    postDisplay : models.PostDisplay;
    canLoadMore: boolean;
    grabMorePosts() : void;
    scrollToAuthorTop() : void;
    displaySubreddit: boolean;
}

interface State
{
    prevProps: Props;
    postsExpanded: boolean;
    loading : boolean;
    expandedPostCount : number;
}

export default class Posts extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = {
            prevProps : props,
            postsExpanded: false,
            loading: false,
            expandedPostCount : 0
        };
    }

    public static getDerivedStateFromProps(nextProps : Props, prevState : State)
    {
        if (prevState.prevProps !== nextProps)
        {
            return {
                ...prevState,
                prevProps: nextProps,
                loading: false 
            };
        }

        return null;
    }

    public render()
    {
        let renderedPosts = [];
        let limit = this.state.postsExpanded ?  this.state.expandedPostCount + config.client.postDisplayCount : config.client.postDisplayCount;
        let remaining = this.props.posts.length - limit;

        for (let [index, post] of this.props.posts.entries())
        {
            if ( index >= limit )
            {
                break;
            }
            else
            {
                renderedPosts.push( <cells.postCell
                    key={post.id}
                    postDisplay={this.props.postDisplay}
                    post={post}
                    isTopPost={index === 0}
                    displaySubreddit={ this.props.displaySubreddit }
                /> );
            }
        }

        return  <div style={ { height: 'auto', overflow: 'hidden' } } className={authorStyles.posts}>
            
                <components.animations.AutoHeight>
                    {renderedPosts}
                </components.animations.AutoHeight>

                

                <transitions.TransitionGroup>
                        {this.getExpandButton()}
                        {this.getCollapseButton()}
                </transitions.TransitionGroup>

            </div>;
    }

    public canExpand() : boolean
    {
        return (this.props.posts.length > (this.state.expandedPostCount + config.client.postDisplayCount) || this.props.canLoadMore);
    }

    public expandPosts()
    {
        if (this.state.loading)
            return;

        // if (this.state.postsExpanded)
        // {
        //    this.grabMorePosts();
        // }
        // else
        {

            let newCount : number = this.state.expandedPostCount + config.client.postExpandCount;

            // Just expanding, grab more if necessary
            if (this.props.posts.length <= newCount && this.props.canLoadMore)
            {
                this.grabMorePosts();
                this.setState( { ...this.state, loading: true, postsExpanded: true, expandedPostCount: newCount   } );
            }
            else
            {
                this.setState( { ...this.state, postsExpanded: true, expandedPostCount: newCount } );
            }
        }
    }

    public collapsePosts()
    {
        // Do not allow if loading posts
        if (this.state.loading)
            return;

        this.props.scrollToAuthorTop();
        this.setState( { postsExpanded: false,  expandedPostCount: 0 } );
    }

    public grabMorePosts()
    {
        this.props.grabMorePosts();
    }

 

    ///////////////////////
    // Elements 
    ///////////////////////

    public getExpandButton()
    {
        if (!this.canExpand() )
            return null;

        return <components.transitions.FadeVerticalResize key={'_expandButton'}>
                <div className={authorStyles.morePostsContainer}  onClick={ () => this.expandPosts() } > 
                        <div className={authorStyles.morePostsInnerContainer}>
                            <SVGInline className={authorStyles.morePostsButton} svg={expand_caret}/>
                        </div>

                        <span>{this.state.loading ? 'Loading...' : 'More posts'}</span>
                </div>
            </components.transitions.FadeVerticalResize >;
    }

    public getCollapseButton()
    {
        if (!this.state.postsExpanded)
            return null;

        return  <components.transitions.FadeVerticalResize key={'collapse_button_container'}>
                    <div className={authorStyles.morePostsContainer} key={"_collapsebutton"} onClick={ () => this.collapsePosts() } >
                        <div className={authorStyles.morePostsInnerContainer}> 
                            <SVGInline className={authorStyles.morePostsButton} svg={collapse_caret}/>
                        </div>
                    </div>
                </components.transitions.FadeVerticalResize>;
    }
    
}
