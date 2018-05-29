import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'
import { isNullOrUndefined } from 'util';

import * as styles from 'css/post.scss'

import vote from 'assets/images/vote.svg'
import { numberTo4CharDisplayString } from '~/common/tools/number';
import { ENGINE_METHOD_DIGESTS } from 'constants';

interface Props
{
    post: models.reddit.Post;
    postDisplay: models.PostDisplay;
    isTopPost: boolean;
    displaySubreddit: boolean;
}

export default class PostCell extends React.Component<Props, null>
{

    danger_flairs : Set<string> = new Set<string>();

    constructor( props : Props)
    {
        super(props);
        this.danger_flairs.add("nsfw");
        this.danger_flairs.add("nsfl");
        this.danger_flairs.add("spoiler");
    }

    render()
    {
        return this.getCompactPost();
    }

    getCompactPost()
    {
        return <div className={this.props.isTopPost ? `${styles.postContainer} ${styles.topPost}` : styles.postContainer}>
            <div className={styles.postReadContainer} >
                {this.getUpvoted(this.props.post.likes)}
            </div>
            <div className={this.props.isTopPost ?  styles.topScoreContainer  :  styles.scoreContainer }>
                {this.getScoreCol()}
            </div>
            {this.getFlair()}
            {this.getSpoiler()}
            <div className={styles.post}> <a href={urls.getPostUrl(this.props.post.subreddit, this.props.post.id)}> {this.props.post.title} </a>  </div> 
            <div className={styles.postedDate}>
                {this.getDateCol()}
            </div>
            {this.getSubreddit()}
            </div>

    }

    getFlair()
    {
        if (this.props.post.link_flair_text != null)
        {
            return <div className={ this.getFlairClass(this.props.post.link_flair_text) }>{this.props.post.link_flair_text}</div>
        }
    }

    getSpoiler()
    {
        if (this.props.post.spoiler)
        {
            return <div className={ styles.spoiler }>Spoiler</div>
        }
    }  

    getFlairClass( flair : string)
    {
        if ( this.danger_flairs.has( flair.toLowerCase() ) )
        {
            return styles.nsfw_flair;
        }
        else
        {
            return styles.flair;
        }
    }

    getComments()
    {
        return <div className={styles.flair}>{this.props.post.link_flair_text}</div>
    }

    getSubreddit()
    {
        if (this.props.displaySubreddit)
            return <div className={styles.subreddit}><a href={urls.getPostUrl(this.props.post.subreddit, this.props.post.id)}>to r/<b>{this.props.post.subreddit}</b></a></div>
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
        let style = styles.voteIndicator;
        if (upvoted)
        {
            style =  styles.upvote;;
        }
        else if (upvoted != null)
        {
            style = styles.downvote;;
        }

       return <svg className={style} >
            <use xlinkHref={vote}></use>
        </svg>
    }
    
}