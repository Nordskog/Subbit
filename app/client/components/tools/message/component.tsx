import * as React from 'react';
import * as models from '~/common/models'
import * as siteStyles from 'css/site.scss'
import * as styles from 'css/message.scss'

import ReactSVG from 'react-svg'
import loading_done = require('assets/animations/loading_done.svg')

import subscribeButton from 'assets/images/subscribe_button.svg'
import subscribeSubredditButton from 'assets/images/subscribe_subreddit_button.svg'
import subscribedPartialButton from 'assets/images/subscribed_partial_button.svg'
import expand_caret from 'assets/images/expand_caret.svg'

import { classConcat } from '~/common/tools/css';

import * as authorStyles from 'css/author.scss'
import { urls } from '~/common';

import config from 'root/config'

export enum MessageType 
{
  NOT_LOGGED_IN, NO_SUBSCRIPTIONS
}

interface Props
{
  message : MessageType;
}

export default class MessageComponent extends React.Component<Props,null> 
{

  render() 
  {
    return this.getMessage();
  }

  getMessage()
  {
    switch(this.props.message)
    {
        case MessageType.NOT_LOGGED_IN:
        {
          return this.getNoSubscriptionsMessage(false);
        }

        case MessageType.NO_SUBSCRIPTIONS:
        {
          return this.getNoSubscriptionsMessage(true);
        }

        default:
          return this.getNoSubscriptionsMessage(false);
    }
  } 




  ////////////////////////////
  // No subscriptions
  ////////////////////////////


  getSubscribeButton()
  {
      //Heh
      let element = <div className={authorStyles.subscriptionButtonContainer}>
                      <svg className={authorStyles.subscribeButton} >
                          <use xlinkHref={subscribeButton}></use>
                      </svg>
                  </div>

      return <div className={styles.corner}>
      {element}
      </div>
  }

  getSubscribeSubredditButton()
  {
      //Heh
      let element =  <div className={authorStyles.subscriptionButtonContainer} style={ { position:"relative" } } >
                  <svg className={authorStyles.unsubscribeButton} style={ { position:"absolute" } } >
                      <use xlinkHref={subscribeSubredditButton}></use>
                  </svg>
                  <svg className={authorStyles.subscribeButton} style={ { position:"absolute" } } >
                      <use xlinkHref={subscribeButton}></use>
                  </svg>
              </div>

      return <div className={styles.corner}>
      {element}
      {this.getExpandCaret(true)}
      </div>

  }

  getExpandCaret( hidden : boolean)
  {
    let element =  <div className={ classConcat( authorStyles.displaySubredditsButtonContainer, styles.caret, hidden ? styles.hidden : null ) }>
              <svg className={authorStyles.displaySubredditsButton} >
                  <use xlinkHref={ expand_caret}></use>
              </svg>
          </div>

    return element;
  }

  getExpandExample()
  {
      let element =  <div className={ classConcat( authorStyles.subscriptionButtonContainer, styles.hidden ) } >
                  <svg className={authorStyles.unsubscribeButton} >
                      <use xlinkHref={subscribeButton}></use>
                  </svg>
              </div>

      return <div className={styles.corner}>
              {element}
              {this.getExpandCaret(false)}
             </div>
              
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
      
      let element =  <div className={authorStyles.subscriptionButtonContainer} >
                  <svg className={authorStyles.unsubscribeButton} >
                      <use xlinkHref={svgName}></use>
                  </svg>
              </div>

      return <div className={styles.corner}>
              {element}
              {this.getExpandCaret(true)}
             </div>
              
  }

  getNoSubscriptionsLoginMessage( authenticated : boolean)
  {
    if (authenticated)
    {
      return <div className={styles.loginContainer}>
                <span>You haven't subscribed to anyone yet!</span>
                <div className={styles.spacer}/>
                <div className={styles.spanRow}>
                  <span>Go</span>
                  <svg className={authorStyles.unsubscribeButton} >
                      <use xlinkHref={subscribeButton}></use>
                  </svg>
                  <span>your favorite authors!</span>

                </div>


            </div>
    }
    else
    {
      return <div className={styles.loginContainer}>
                <span>Papers, please.</span>
                <div className={styles.spacer}/>

                <div className={siteStyles.loginContainer}>
                  <a href={urls.RFY_AUTHORIZE_REMOTE} className={ classConcat( siteStyles.button, styles.loginButton)}>Login with Reddit</a>
                </div> 
            </div>
      
    }
  }

  getNoSubscriptionsMessage( authenticated : boolean )
  {
    return <div className={styles.container}>
              <ReactSVG className={siteStyles.loadingImage}
              path={loading_done}
              evalScripts={"never"} />
              <div className={styles.title}>
                <span>Welcome to {config.client.siteName}!</span>
              </div>

              <span>Subscribed authors will appear here</span>

              <div className={styles.spacer}/>

              { this.getNoSubscriptionsLoginMessage(authenticated) }


              <div className={styles.spacer}/>

              <div className={styles.rowMessageCenterer}>
                <div className={styles.row}>
                  {this.getSubscribeButton()}
                  {this.getTextMessage("Not subscribed")}
                </div>
                <div className={styles.row}>
                  {this.getUnsubscribeButton(true)}
                  {this.getTextMessage("Subscribed in some Subreddits")}
                </div>
                <div className={styles.row}>
                  {this.getUnsubscribeButton(false)}
                  {this.getTextMessage("Subscribed in all Subreddits")}
                </div>
                <div className={styles.row}>
                  {this.getSubscribeSubredditButton()}
                  {this.getTextMessage("Subscribed, but not in this Subreddit")}
                </div>
                <div className={styles.row}>
                  {this.getExpandExample()}
                  {this.getTextMessage("Manage subscribed Subreddits")}
                </div>
              </div>


            </div>
  }

  getTextMessage( text : string )
  {
    return <span className={styles.rowMessage}>{text}</span>
  }

}