import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'
import { isNullOrUndefined } from 'util';

import vote from 'assets/images/vote.svg'

interface Props
{
    post: models.reddit.Post;
    isTopPost: boolean;
}

export default class PostCell extends React.Component<Props, null>
{
    render()
    {
        return <div className={this.props.isTopPost ? "author-postContainer author-topPost" : "author-postContainer"}>
                
            <div className="author-postReadContainer" >
                {this.getUpvoted(this.props.post.likes)}
            </div>
            <div className={this.props.isTopPost ?  "author-topScoreContainer" :  "author-scoreContainer"}>
                {this.getScoreCol()}
            </div>
            <div className="author-post"> <a href={urls.getPostUrl(this.props.post.subreddit, this.props.post.id)}> {this.props.post.title} </a>  </div> 
                   <div className="author-postedDate">
                       {this.getDateCol()}
                   </div>
                </div>
    }

    getDateCol()
    {
        return <span> {tools.time.getTimeSinceDisplayString(this.props.post.created_utc)} </span>;
    }

    getScoreCol()
    {
        return <span> {tools.number.numberTo4CharDisplayString(this.props.post.score)} </span>;
    }

    getUpvoted(upvoted : boolean)
    {
        let style = "author-voteIndicator";
        if (upvoted)
        {
            style =  "author-upvote";;
        }
        else if (upvoted != null)
        {
            style = "author-downvote";;
        }

       return <svg className={style} >
            <use xlinkHref={vote}></use>
        </svg>
    }
    
}