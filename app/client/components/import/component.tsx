import * as React from 'react';
import * as models from '~/common/models';
import * as siteStyles from 'css/site.scss';
import * as styles from 'css/message.scss';

import SVGInline from "react-svg-inline";
import * as loading_done from 'assets/animations/loading_done.svg'; // TODO think about fancy svgs
import * as loading_animation from 'assets/animations/loading_animation.svg';
import * as loading_error from 'assets/animations/loading_error.svg';

import * as components from '~/client/components';

import MediaQuery from 'react-responsive';

import { classConcat } from '~/common/tools/css';

import * as authorStyles from 'css/author.scss';
import { urls } from '~/common';

import * as actions from '~/client/actions';
import { NavLink } from 'redux-first-router-link';

import * as tools from '~/common/tools';

import config from 'root/config';
import { LoginType } from '~/common/models/auth';
import { ImportStatus } from '~/common/models/reddit';

enum ComponentStatus 
{
  IDLE, CANCELLED, WORKING, WAITING
}

interface Props
{ 
  AdditionalAuthValid : boolean;
  checkForRecentUpdateMeBotListRequest() : Promise<boolean>;
  checkForUpdateMeNowReply() : Promise<ImportStatus>; 
  requestSubscriptionsFromUpdateMeBot() : Promise<boolean>;
  navigateToImported() : void;
}

interface State 
{
  status: ComponentStatus;
  message : string;
}

export default class ImportComponent extends React.Component<Props, State> 
{
  private checkInboxTimeout = null;
  private lastRequestTime : number = 0;

  public state = { status: ComponentStatus.IDLE, message: "hello" };

  public render() 
  {
    return this.getMessage();
  }
  
  public componentWillUnmount()
  {
    this.cancel(false);
  }

  /////////////////////////////
  // Logic
  /////////////////////////////

  private updateWorkingMessage( message : string, status : ComponentStatus = ComponentStatus.WORKING )
  {
    this.setState( { status: status, message: message } );
  }

  private isStaleRequest( requestTime : number)
  {
    return requestTime !== this.lastRequestTime;
  }

  private async importSubscriptions() : Promise<ImportStatus>
  {
    let requestTime = Date.now();
    this.lastRequestTime = requestTime;

    this.updateWorkingMessage("Checking inbox for existing reply");
    
    ///////////////////////////////
    // Check for existing message
    ///////////////////////////////

    let nextDisplayUpdate = tools.time.getTimeAfterDuration(2000);
    let status : ImportStatus = await this.props.checkForUpdateMeNowReply();
    await tools.time.sleepUntil(nextDisplayUpdate);
    
    if (this.isStaleRequest(requestTime))
      return;

    if (status === ImportStatus.ERROR )  // Stop stuff
    {
      this.cancel(true);
      return;
    }

    if (status === ImportStatus.MESSAGE_FOUND )  // Page will change, do nothing.
    {
      this.props.navigateToImported();
      return;
    }

    ////////////////////////////////////////
    // Message UpdateMeBot requesting list
    ////////////////////////////////////////

    // Otherwise send message requesting list
	this.updateWorkingMessage("Nothing found, will message UpdateMeBot");
	
	// Actually check outbox for existing message to bot first
    nextDisplayUpdate = tools.time.getTimeAfterDuration(2000);
    let alreadySent : boolean = await this.props.checkForRecentUpdateMeBotListRequest();
    await tools.time.sleepUntil(nextDisplayUpdate);

	if (alreadySent)
	{	
		console.log("Already sent");
		this.updateWorkingMessage("Found existing request in outbox");
		await tools.time.sleep(2000);
  }
  else 
  {
    nextDisplayUpdate = tools.time.getTimeAfterDuration(2000);
    let sendStatus : boolean = await this.props.requestSubscriptionsFromUpdateMeBot();
    await tools.time.sleepUntil(nextDisplayUpdate);

    if (this.isStaleRequest(requestTime))
      return;

    if ( !sendStatus )
    {
      this.cancel(true);
      return;
    }
  }

    /////////////////////////////////////////
    // Check inbox on a loop
    //////////////////////////////////////////

    this.checkInboxLooper(requestTime, alreadySent);
  }

  // True if operation should cancel, false if continue
  private async checkInboxLooper( requestTime : number, skipFirstWait : boolean)
  {
	if ( !skipFirstWait )
		this.updateWorkingMessage("Will check inbox in 15 seconds", ComponentStatus.WAITING);

	this.clearTimeout();
	this.checkInboxTimeout = setTimeout( async () => 
	{
		this.updateWorkingMessage("Checking inbox...");

		let nextDisplayUpdate : number = tools.time.getTimeAfterDuration(2000);
		let status : ImportStatus = await this.props.checkForUpdateMeNowReply();
		if (this.isStaleRequest(requestTime))
		  return;

		if (status === ImportStatus.ERROR )  // Stop stuff
		{
      this.cancel(true);
      return;
		}

		if (status === ImportStatus.MESSAGE_FOUND )  
		{
      this.props.navigateToImported();
      return;
		}

		await tools.time.sleepUntil(nextDisplayUpdate); // Wait so message is visible for a bit
		
		if (this.isStaleRequest(requestTime))
      return;

		this.checkInboxLooper(requestTime, false);

	}, skipFirstWait ? 0 : ( 1000 * 13 ) );  // 13 because we wait 2 sec inside loop

  
  }

  private clearTimeout()
  {
    if (this.checkInboxTimeout != null)
    {
      clearTimeout(this.checkInboxTimeout);
    }
  }

  private cancel( error : boolean )
  {
    this.lastRequestTime = 0;
    this.clearTimeout();
    if (error)
    {
      this.setState( { status: ComponentStatus.CANCELLED, message: "Something went wrong" } );
    }
    else 
    {
      this.setState( { status: ComponentStatus.CANCELLED, message: "Cancelled" } );
    }
  }

  ////////////////////////////////////
  // UI
  ////////////////////////////////////

  private getButton( mobile : boolean )
  {
    if (this.props.AdditionalAuthValid)
    {
      if ( this.state.status === ComponentStatus.IDLE || this.state.status === ComponentStatus.CANCELLED )
      {
        return <div 
        onClick={ () => this.importSubscriptions() }
        className={ siteStyles.cardButton }>Import subscriptions</div>;
      }
      else
      {
        return <div 
        onClick={ () => this.cancel(false) }
        className={  siteStyles.cardButton }>Cancel</div>;
      }


    }
    else 
    {
      return <a href={ urls.getClientLoginUrl( LoginType.REDDIT_ADDITIONAL_AUTH, mobile ) } 
      className={  siteStyles.cardButton }>Request permission</a>;
    }

  }

  private getTopMessage()
  {
    if (this.props.AdditionalAuthValid)
    {
      return <span>This process will take several minutes</span>;
    }
    else 
    {
      return <span>I'm only going to ask you this once</span>;
    }
  }

  private getContent()
  {
    return <MediaQuery query="screen and (max-width: 1100px)">
              {
                  (matches: boolean) =>
                  {
                    return <div className={styles.paragraphContainer}>
                            <div className={styles.loginContainerOuter}>
                            {this.getTopMessage()}
                            <div className={ styles.wideLoginContainer}>
                              {this.getButton(matches)}
                            </div> 
                             {this.getStatusMessage()}
                             {this.getTimeProgressBar()}
                            </div>
                          </div>;
                    }
              }
              </MediaQuery>;
  }

  private getImage()
  {
    switch( this.state.status )
    {
      case ComponentStatus.CANCELLED:
        return <SVGInline  className={siteStyles.loadingImage} svg={ loading_error}/>;
      case ComponentStatus.IDLE:
        return <SVGInline  className={siteStyles.loadingImage} svg={ loading_done}/>;
      case ComponentStatus.WORKING:
      case ComponentStatus.WAITING:
        return <SVGInline  className={siteStyles.loadingImage} svg={ loading_animation}/>;
    }
  }

  private getMessage()
  {
    return <div className={styles.container}>
    
            {this.getImage()}
              <div className={styles.title}>
                <span>Import from UpdateMeBot</span>
              </div>
              { this.getContent() }
              <div className={styles.spacer}/>

            </div>;
  }

  private getStatusMessage()
  {
    if (this.state.status === ComponentStatus.IDLE && !this.props.AdditionalAuthValid)
    {
      return <span>{config.client.siteName} will require temporary permission to send and receive messages using your Reddit account</span>;
    }
    else if ( this.state.status !== ComponentStatus.IDLE )
    {
      return <span>{this.state.message}</span>;
    }
  }

  private getTimeProgressBar()
  {
    if (this.state.status === ComponentStatus.IDLE)
    {
      return null;
    }
    else 
    {
      if (this.state.status === ComponentStatus.WAITING)
      {
        return <components.tools.TimeProgress
                  durationSeconds={12.0}
                  loading={true} />;
      } 
      else
      {
        return <components.tools.TimeProgress
                  durationSeconds={12.0}
                  loading={false} />;
      }

    }
  }
}
