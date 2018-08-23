import * as React from 'react';

import * as actions from '~/client/actions';
import * as models from '~/common/models';
import * as tools from '~/common/tools';
import * as urls from '~/common/urls';
import * as styles from 'css/post.scss';

import * as vote from 'assets/images/vote.svg';
import { PostDisplay } from '~/common/models';
import { NavLink } from 'redux-first-router-link';
import { classConcat } from '~/common/tools/css';
import SVGInline from "react-svg-inline";

import defaultThumbnail from 'assets/images/thumbnail_default.png';
import selfThumbnail from 'assets/images/thumbnail_self.png';
import nsfwThubmnail from 'assets/images/thumbnail_nsfw.png';

const dangerFlairs : Set<string> = new Set<string>();
dangerFlairs.add("nsfw");
dangerFlairs.add("nsfl");
dangerFlairs.add("spoiler");

const defaultThumbnails : Map<string, any> = new Map<string, any>();
defaultThumbnails.set("self",selfThumbnail);
defaultThumbnails.set("default",defaultThumbnail);
defaultThumbnails.set("nsfw",nsfwThubmnail);
defaultThumbnails.set("spoiler",defaultThumbnail);

interface Props
{
    post: models.reddit.Post;
    postDisplay: models.PostDisplay;
    isTopPost: boolean;
    displaySubreddit: boolean;
}

export default class PostCell extends React.Component<Props, null>
{

    public render()
    {
        switch( this.props.postDisplay )
        {
            case models.PostDisplay.MINIMAL:
                return this.getMinimalPost();
            case models.PostDisplay.COMPACT:
                return this.getCompactPost();
            case models.PostDisplay.FULL:
                return this.getNormalPost();
        }
    }

    private getMinimalPost()
    {
        return <div className={this.props.isTopPost ? `${styles.postContainer} ${styles.topPostContainer}` : styles.postContainer}>
            <div className={styles.voteScoreImageAlignerOuter}>
                <div className={styles.voteScoreImageAligner}>
                    {this.getUpvoted(this.props.post.likes)}
                    {this.getScoreCol()}
                </div>
            </div>
        {
                this.getLink
                (
                    true,
                    this.getDateCol(),
                )
            }
        </div>;
    }

    private getCompactPost()
    {
        return <div className={this.props.isTopPost ? `${styles.postContainer} ${styles.topPostContainer}` : styles.postContainer}>
            <div className={styles.voteScoreImageAlignerOuter}>
                <div className={styles.voteScoreImageAligner}>
                    {this.getUpvoted(this.props.post.likes)}
                    {this.getScoreCol()}
                    {this.getImage()}
                </div>
            </div>
            {
                this.getLink
                (
                    true,
                    <div key={"info_container"} className={styles.infoContainer}>
                        {this.getDateCol()}
                        {this.getSubreddit()}
                        {this.getComments()}
                    </div>
                )
            }
            </div>;
    }

    private getTitleLinebreakFix()
    {
        // For some inane reason, the last word of the title will 
        // follow the posted date and whatnot and be broken to the next line,
        // despite there being plenty of space available on the first line.
        // It only moves the last element, so inserting an empty span inside
        // the title link leaves the rest of the title unharmed.
        return <span> </span>;
    }

    private getLink( includeFlairs : boolean = true, ...inlineElements : JSX.Element[])
    {
        return <div className={styles.postTitlecenterer}>
                    <div className={styles.post}>
                        { this.getFlairsAndStuff() }
                        <a className={styles.postLink} href={this.props.post.url}>
                            {this.props.post.title}
                        </a>
                        <span className={styles.postLinkRightMargin}/>
                        {inlineElements}
                        </div> 
                 </div>; 
        
    }

    private getNormalPost()
    {
        return <div className={this.props.isTopPost ? `${styles.postContainer} ${styles.topPostContainer}` : styles.postContainer}>
            <div className={styles.voteScoreImageAlignerOuter}>
                <div className={styles.voteScoreImageAligner}>
                    {this.getUpvoted(this.props.post.likes)}
                    {this.getScoreCol()}
                    {this.getImage()}
                </div>
            </div>

            <div className={styles.titleAndInfoSeparator}>
            {
                this.getLink
                (
                    true
                )
            }
            <div className={styles.infoContainer}>
                {this.getDateCol()}
                {this.getSubreddit()}
                {this.getComments()}
            </div>

            </div>

            </div>;

    }

    private getFlairsAndStuff()
    {
        return [this.getFlair(), this.getSpoiler(), this.getNsfwFlair() ];
    }

    private getFlair()
    {
        if (this.props.post.link_flair_text != null && this.props.post.link_flair_text.length > 0)
        {
            return <span key={"flair_flair"} className={ this.getFlairClass(this.props.post.link_flair_text) }>{this.props.post.link_flair_text}</span>;
        }
    }

    private getSpoiler()
    {
        if (this.props.post.spoiler)
        {
            return <span key={"spoiler_flair"} className={ styles.spoiler }>Spoiler</span>;
        }
    }  

    private getNsfwFlair()
    {
        if (this.props.post.over_18)
        {
            return <span key={"nsfw_flair"} className={ styles.nsfw_flair }>NSFW</span>;
        }
    }

    private getFlairClass( flair : string)
    {
        if ( dangerFlairs.has( flair.toLowerCase() ) )
        {
            return styles.nsfw_flair;
        }
        else
        {
            return styles.flair;
        }
    }

    private getImage()
    {
        let url : string = this.props.post.thumbnail;

        // In chrome they are sometimes "" instead of null ... ?
        if (url == null || url.length < 1)
        {
            url = defaultThumbnail;
        }
        else
        {
            url = defaultThumbnails.get(this.props.post.thumbnail) || url;
        }

        let style = [];
        style.push( this.props.postDisplay === PostDisplay.FULL ? styles.imageContainer : styles.tinyImageContainer );
        if (this.props.isTopPost)
            style.push( styles.topImage );

        return  <a href={this.props.post.url} className={styles.imageVerticalCenter} >
                    <img className={ classConcat(...style) } src={url}/>
                </a>;  
    }

    private getComments()
    {
        return <span key={"comments_span"} className={styles.comments}><a href={urls.getPostUrl(this.props.post.subreddit, this.props.post.id)}>{this.props.post.num_comments} comments</a></span>;
    }

    private getSubreddit()
    {
        if (this.props.displaySubreddit)
            return  <span className={styles.subreddit} key={"subreddit_span"}>
                        <NavLink 
                            className={styles.subreddit}
                            to={ { type: actions.types.Route.SUBREDDIT, payload: { subreddit: this.props.post.subreddit } }  }>
                            to r/<b>{this.props.post.subreddit}</b>
                        </NavLink>
                    </span>;
    }

    private getDateCol()
    {
            return <span key={"date_span"} className={styles.postedDate}> {tools.time.getTimeSinceDisplayString(this.props.post.created_utc)} </span>;
    }

    private getScoreCol()
    {   
        return <div className={this.props.isTopPost ?  styles.topScoreContainer  :  styles.scoreContainer } key={"score_col"} >
                    <span> {tools.number.numberTo4CharDisplayString(this.props.post.score)} </span>
                </div>;
    }

    private getUpvoted(upvoted : boolean)
    {
        let style = styles.voteIndicator;
        if (upvoted)
        {
            style =  styles.upvote;
        }
        else if (upvoted != null)
        {
            style = styles.downvote;
        }

       return   <div className={styles.postReadContainer} >
                        <SVGInline className={style} svg={vote}/>
                </div>;
       

    }
    
}
