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

const danger_flairs : Set<string> = new Set<string>();
danger_flairs.add("nsfw");
danger_flairs.add("nsfl");
danger_flairs.add("spoiler");

const defaultThumbnails : Map<string, string> = new Map<string, string>();
defaultThumbnails.set("self","https://www.reddit.com/static/self_default2.png");
defaultThumbnails.set("default","https://www.reddit.com/static/noimage.png");
defaultThumbnails.set("nsfw","https://www.reddit.com/static/nsfw2.png");
defaultThumbnails.set("spoiler","https://www.reddit.com/static/self_default2.png");
const defaultThumbnail = "https://www.reddit.com/static/self_default2.png"

interface Props
{
    post: models.reddit.Post;
    postDisplay: models.PostDisplay;
    isTopPost: boolean;
    displaySubreddit: boolean;
}

export default class PostCell extends React.Component<Props, null>
{

    render()
    {
        switch( this.props.postDisplay )
        {
            case models.PostDisplay.COMPACT:
                return this.getCompactPost();
            case models.PostDisplay.NORMAL:
                return this.getNormalPost();
        }
    }

    getCompactPost()
    {
        return <div className={this.props.isTopPost ? `${styles.postContainer} ${styles.topPost}` : styles.postContainer}>
            {this.getUpvoted(this.props.post.likes)}
            {this.getScoreCol()}
            {this.getLink()}
            <div className={styles.postedDate}>
                {this.getDateCol()}
            </div>
            {this.getSubreddit()}
            {this.getComments()}
            </div>
    }

    getLink( includeFlairs : boolean = true)
    {
        return <div className={styles.post}>{includeFlairs ? this.getFlairsAndStuff() : null }<a href={this.props.post.url}>{this.props.post.title} </a>  </div> 
    }

    getNormalPost()
    {
        return <div className={this.props.isTopPost ? `${styles.postContainer} ${styles.topPost}` : styles.postContainer}>
                    <div className={styles.voteAndScoreCenterer}>
                        <div className={styles.voteAndScoreCentererInner}>
                            {this.getUpvoted(this.props.post.likes)}
                            {this.getScoreCol()}
                        </div>
                    </div>
                    {this.getImage()}
                    <div className={styles.postColumn} >
                        <div className={styles.postLinkContainer}>
                            {this.getLink()}
                            {this.getComments()}
                        </div>
                        <div className={styles.postInfoContainer}>  
                            <div className={styles.postedDate}>
                            {this.getDateCol()}
                            </div>
                            {this.getSubreddit()}
                        </div>
                    </div>

                </div>

    }

    getFlairsAndStuff()
    {
        return [this.getFlair(), this.getSpoiler(), this.getNsfwFlair() ]
    }

    getFlair()
    {
        if (this.props.post.link_flair_text != null && this.props.post.link_flair_text.length > 0)
        {
            return <span key={"flair_flair"} className={ this.getFlairClass(this.props.post.link_flair_text) }>{this.props.post.link_flair_text}</span>
        }
    }

    getSpoiler()
    {
        if (this.props.post.spoiler)
        {
            return <span key={"spoiler_flair"} className={ styles.spoiler }>Spoiler</span>
        }
    }  

    getNsfwFlair()
    {
        if (this.props.post.over_18)
        {
            return <span key={"nsfw_flair"} className={ styles.nsfw_flair }>NSFW</span>
        }
    }

    getFlairClass( flair : string)
    {
        if ( danger_flairs.has( flair.toLowerCase() ) )
        {
            return styles.nsfw_flair;
        }
        else
        {
            return styles.flair;
        }
    }

    getImage()
    {
        let url : string = this.props.post.thumbnail;
        if (url == null)
        {
            url = defaultThumbnail;
        }
        else
        {
            url = defaultThumbnails.get(this.props.post.thumbnail) || url;
        }


        return  <a href={this.props.post.url}>
                    <img className={styles.imageContainer} src={url}/>
                </a>  
    }

    getComments()
    {
        return <div className={styles.comments}><a href={urls.getPostUrl(this.props.post.subreddit, this.props.post.id)}>{this.props.post.num_comments} comments</a></div>
    }

    getSubreddit()
    {
           if (this.props.displaySubreddit)
             return <div className={styles.subreddit}>to <a href={urls.getSubredditUrl(this.props.post.subreddit)}>r/<b>{this.props.post.subreddit}</b></a></div>
    }

    getDateCol()
    {
        return <span> {tools.time.getTimeSinceDisplayString(this.props.post.created_utc)} </span>;
    }

    getScoreCol()
    {   
        return <div className={this.props.isTopPost ?  styles.topScoreContainer  :  styles.scoreContainer } >
                    <span> {tools.number.numberTo4CharDisplayString(this.props.post.score)} </span>
                </div>
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

       return   <div className={styles.postReadContainer} >
                    <svg className={style} >
                        <use xlinkHref={vote}></use>
                    </svg>
                </div>
       

    }
    
}