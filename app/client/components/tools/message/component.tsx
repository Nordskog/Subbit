import * as React from 'react';
import * as models from '~/common/models'
import * as siteStyles from 'css/site.scss'
import * as styles from 'css/message.scss'

import SVGInline from "react-svg-inline"
import * as loading_done from 'assets/animations/loading_done.svg' //TODO think about fancy svgs
import * as subscribeButton from 'assets/images/subscribe_button.svg'
import * as subscribeSubredditButton from 'assets/images/subscribe_subreddit_button.svg'
import * as subscribedPartialButton from 'assets/images/subscribed_partial_button.svg'
import * as expand_caret from 'assets/images/expand_caret.svg'
import * as loadingAnimation from 'assets/animations/loading_animation.svg'

import * as components from '~/client/components'

import MediaQuery from 'react-responsive'

import { classConcat } from '~/common/tools/css';

import * as authorStyles from 'css/author.scss'
import { urls } from '~/common';

import * as actions from '~/client/actions'
import { NavLink} from 'redux-first-router-link'

import config from 'root/config'

export enum MessageType 
{
  NOT_LOGGED_IN, NO_SUBSCRIPTIONS, ABOUT, PRIVACY, WAITING
}

interface Props
{
  message : MessageType;
}

interface State 
{
  rememberMe : boolean;
}

export default class MessageComponent extends React.Component<Props,State> 
{

  state = { rememberMe : true };

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

        case MessageType.ABOUT:
        {
          return this.getAboutMessage();
        }

        case MessageType.PRIVACY:
        {
          return this.getPrivacyMessage();
        }

        case MessageType.WAITING:
        {
          return this.getWaiting();
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
                      <SVGInline className={authorStyles.subscribeButton} svg={subscribeButton}/>
                  </div>

      return <div className={styles.corner}>
      {element}
      </div>
  }

  getSubscribeSubredditButton()
  {
      //Heh
      let element : JSX.Element = <div key={"subscribe_subreddit_button"} className={authorStyles.subscriptionButtonContainer} style={ { position:"relative" } } >
                                    <div className={authorStyles.subscriptionButtonOverlapContainer}>
                                        <div className={authorStyles.subscriptionButton} style={ { position:"absolute" } }>
                                            <SVGInline  className={authorStyles.unsubscribeButton} svg={subscribeSubredditButton}/>
                                        </div>
                                        <div className={authorStyles.subscriptionButton} style={ { position:"absolute" } }>
                                            <SVGInline  className={authorStyles.subscribeButton} svg={subscribeButton}/>
                                        </div>
                                    </div>
                                </div>

      return <div className={styles.corner}>
      {element}
      {this.getExpandCaret(true)}
      </div>

  }

  getExpandCaret( hidden : boolean)
  {
    let element =  <div className={ classConcat( authorStyles.displaySubredditsButtonContainer, styles.caret, hidden ? styles.hidden : null ) }>
                    <SVGInline className={authorStyles.displaySubredditsButton} svg={expand_caret}/>
                  </div>

    return element;
  }

  getExpandExample()
  {
      let element =  <div className={ classConcat( authorStyles.subscriptionButtonContainer, styles.hidden ) } >
                        <SVGInline className={authorStyles.unsubscribeButton} svg={subscribeButton}/>
                      </div>

      return <div className={styles.corner}>
              {element}
              {this.getExpandCaret(false)}
             </div>
              
  }

  getRememberMeCheckbox()
  {
    return  <div className={styles.rememberMeContainer} onClick={ () => this.setRememberMe( !this.state.rememberMe ) }>
            <components.tools.Checkbox checked={this.state.rememberMe} callback={ (checked) => this.setRememberMe(checked) } />
             Remember me 
            </div>
  }

  setRememberMe( rememberMe : boolean ) 
  {
    this.setState( { rememberMe : rememberMe } );
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
                      <SVGInline className={authorStyles.unsubscribeButton} svg={svgName}/>
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
                  <SVGInline className={authorStyles.unsubscribeButton} svg={subscribeButton}/>
                  <span>your favorite authors!</span>

                </div>
                


            </div>
    }
    else
    {
      return  <MediaQuery query="screen and (max-width: 1100px)">
              {
                  (matches : boolean) => 
                  {
                    return <div className={styles.loginContainer}>
                            <div className={styles.loginContainerOuter}>
                            <span>Papers, please.</span>
                            <div className={styles.loginContainer}>
                              <a href={urls.getClientLoginUrl(!this.state.rememberMe, matches)} className={ classConcat( siteStyles.button, styles.loginButton)}>Login with Reddit</a>
                            </div> 
                            {this.getRememberMeCheckbox()}
                            </div>
                          </div>
                    } 
              }
              </MediaQuery>
    }
  }

  getNoSubscriptionsMessage( authenticated : boolean )
  {
    return <div className={styles.container}>
              <SVGInline  className={siteStyles.loadingImage} svg={loading_done}/>
              <div className={styles.title}>
                <span>Welcome to {config.client.siteName}!</span>
              </div>

              <span>Subscribed authors will appear here</span>

              <div className={styles.spacer}/>

              { this.getNoSubscriptionsLoginMessage(authenticated) }


              <div className={styles.spacer}/>

              {this.getSubscriptionInfo()}

              <div className={styles.spacer}/>

              {this.getBottomLinks( false, true)}


            </div>
  }

  getTextMessage( text : string )
  {
    return <span className={styles.rowMessage}>{text}</span>
  }

  getSubscriptionInfo()
  {
    return <div className={styles.rowMessageCenterer}>
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
  }

  /////////////////////////////
  // About
  /////////////////////////////

  getBottomLinks( swapPrivacyForAbout : boolean = false, showAbout : boolean = false)
  {

    let getLink = ( to, text) => {

      return <NavLink key={text} className={ styles.link}
      to={ to }>
      {text}
      </NavLink> 
    }

    let optionals = [];

    if (showAbout)
    {
      optionals = [
        getLink( { type: actions.types.Route.ABOUT, payload: { } } as actions.types.Route.ABOUT, "about"),
        getLink( { type: actions.types.Route.PRIVACY, payload: { } } as actions.types.Route.PRIVACY, "privacy")
      ];
    }
    else if (swapPrivacyForAbout)
    {
      optionals = [
        getLink( { type: actions.types.Route.ABOUT, payload: { } } as actions.types.Route.ABOUT, "about"),
      ];
    }
    else
    {
      optionals = [
        getLink( { type: actions.types.Route.PRIVACY, payload: { } } as actions.types.Route.PRIVACY, "privacy")
      ];
    }

    return  <div className={styles.linkContainer}>
                { optionals }
              <a className={styles.link} href={config.client.contactUrl}>Contact</a>
              <a className={styles.link} href={config.client.sourceCodeUrl}>Source code</a>
          </div>
  }

  getAboutMessage()
  {
    //Line breaks in string input is ignored, so I guess we're doing this.
    let aboutMessageParts : string[] = config.client.aboutMessage.split('\n');
    let aboutMessageComponents = [];
    let i = 0;
    for (let part of aboutMessageParts)
    {
      aboutMessageComponents.push( <span key={i}>{part}</span> );
      i++;
    }

    return <div className={styles.container}>
    
            <SVGInline  className={siteStyles.loadingImage} svg={loading_done}/>
              <div className={styles.title}>
                <span>Welcome to {config.client.siteName}!</span>
              </div>

              <div className={styles.paragraphContainer}>
                <span>{config.client.siteName} lets you keep up with your favorite authors on Reddit.</span>
                <div className={styles.spacer}/>
                <span>You can also browse the rest of Reddit,<br/>making it easy to find and subscribe to new authors</span>
              </div>

              <div className={styles.spacer}/>

              <div className={styles.paragraphContainer}>
                {aboutMessageComponents}

              </div>

              <div className={styles.spacer}/>

              {this.getSubscriptionInfo()}

              
              <div className={styles.spacer}/>

              {this.getBottomLinks()}


            </div>
  }

  getPrivacyMessage()
  {
    return <div className={styles.container}>
    
            <SVGInline  className={siteStyles.loadingImage} svg={loading_done}/>
              <div className={styles.title}>
                <span>Privacy Policy</span>
              </div>

              <div className={styles.paragraphContainer}>
                <span className={styles.paragraphTitle}>What information do we collect?</span>
                <div className={styles.spacer}/>
                <span className={styles.leftAlign}>Your Reddit username will be stored permanently to identify your account on this site.</span>
                <span className={styles.leftAlign}>Your IP address will be included in short-term access logs for diagnostics purposes.</span>
                <div className={styles.spacer}/>
                <div className={styles.spacer}/>
                <span className={styles.paragraphTitle}>What information will we access from your Reddit account?</span>
                <div className={styles.spacer}/>
                <span className={styles.leftAlign}>Apart from querying your username, your Reddit account will only be used to list submissions.</span>
                <span className={styles.leftAlign}>The latter is only performed client-side in the browser, and the information never passes through any external servers.</span>
              </div>

              <div className={styles.spacer}/>

              {this.getBottomLinks(true)}


            </div>
  }

  getWaiting()
  {
    return <div className={styles.container}>
      <SVGInline  className={siteStyles.loadingImage} svg={loadingAnimation}/>
    </div>

  }

}