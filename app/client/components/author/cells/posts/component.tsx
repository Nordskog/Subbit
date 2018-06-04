import * as React from 'react';


import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'
import { isNullOrUndefined } from 'util';

import vote from 'assets/images/vote.svg'

import * as config from '~/config'

import * as cells from './cells'


import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

import * as components from '~/client/components'

import * as transitions from 'react-transition-group'
import { numberTo4CharDisplayString } from '~/common/tools/number';

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
            postsExpanded: false,
            loading: false,
            expandedPostCount : 0
        }
    }

    componentWillReceiveProps(nextProps : Readonly<Props>) 
    {
        if (this.state.loading)
        {
            this.setState( {
                ...this.state,
                loading: false 
            });
        }
    }

    render()
    {
        let renderedPosts = [];
        let limit = this.state.postsExpanded ?  this.state.expandedPostCount + config.postDisplayCount : config.postDisplayCount;
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
                    isTopPost={index==0}
                    displaySubreddit={ this.props.displaySubreddit }
                /> );
            }
        };

        return  <div style={ { height: 'auto', overflow: 'hidden' } } className="author-posts">
            
                <components.animations.AutoHeight>
                    {renderedPosts}
                </components.animations.AutoHeight>

                

                <transitions.TransitionGroup>
                        {this.getExpandButton()}
                        {this.getCollapseButton()}
                </transitions.TransitionGroup>

            </div>
    }

    canExpand() : boolean
    {
        return (this.props.posts.length > (this.state.expandedPostCount + config.postDisplayCount) || this.props.canLoadMore);
    }

    expandPosts()
    {
        if (this.state.loading)
            return;

        //if (this.state.postsExpanded)
        //{
        //    this.grabMorePosts();
        //}
        //else
        {

            let newCount : number = this.state.expandedPostCount + config.postExpandCount;

            //Just expanding, grab more if necessary
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

    collapsePosts()
    {
        this.props.scrollToAuthorTop();
        this.setState( { postsExpanded: false,  expandedPostCount: 0 } );
    }

    grabMorePosts()
    {
        this.props.grabMorePosts();
    }

    

    ///////////////////////
    // Elements 
    ///////////////////////

    getExpandButton()
    {
        if (!this.canExpand() )
            return null;

        return <components.transitions.FadeResize key={'_expandButton'}>
                <div className="author-morePostsContainer"  onClick={ () => this.expandPosts() } > 
                        <div className="author-morePostsInnerContainer">
                            <svg className="author-morePostsButton" >
                                <use xlinkHref={expand_caret}></use>
                            </svg>
                        </div>

                        <span>{this.state.loading ? 'Loading...' : 'More posts'}</span>
                </div>
            </components.transitions.FadeResize >
    }

    getCollapseButton()
    {
        if (!this.state.postsExpanded)
            return null;

        return  <components.transitions.FadeResize key={'collapse_button_container'}>
                    <div className="author-morePostsContainer" key={"_collapsebutton"} onClick={ () => this.collapsePosts() } >
                        <div className="author-morePostsInnerContainer"> 
                            <svg className="author-morePostsButton" >
                                <use xlinkHref={collapse_caret}></use>
                            </svg>
                        </div>
                    </div>
                </components.transitions.FadeResize>
    }
    
}