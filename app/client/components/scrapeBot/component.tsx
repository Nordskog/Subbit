import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/manager.scss'

import * as component from '~/client/components/'
import * as models from '~/common/models';
import * as serverActions from '~/backend/actions'

interface Props 
{
    scrapeBot: models.data.ScrapeBot;
    toggleScrapebot( enabled: boolean  ) : void;
    setScrapeBotInterval( interval : number ) : void;
    setScrapeBotConcurrentRequests( concurrent_requests : number ) : void;
    scrapeBotScrapeNow( ) : void;
}

interface State
{
    timeElapsed : number;
    timeUntilNext : number;

}

export default class scrapeBot extends React.Component<Props, State >
{
    counterLoop = null;

    constructor( props : Props)
    {
        super(props);
        this.state = {
            timeElapsed : 0,
            timeUntilNext : 0,
            
        }
    }

    public render()
    {
        console.log("Render!");
        
        return  <div className="manager-subreddit">
                    <div className="manager-nameContainer"> Scrape Bot   
                    
                    </div>

                    <div className="manager-columnContainer">
                        {this.job()}
                        {this.renderJobButtons()}
                    </div>
                </div>
    }

    componentWillMount()
    {
        this.startInterval();
    }

    componentWillUnmount()
    {
        this.stopInterval();
    }

    startInterval()
    {
        this.stopInterval();
        this.counterLoop = setInterval( () => {

            let timeElapsed : number;
            let timeUntilNext : number;

            if (this.props.scrapeBot.processing)
            {
                timeElapsed = Math.round ( (Date.now() / 1000) - this.props.scrapeBot.run_start );
            }
            else
            {
                timeElapsed = this.state.timeElapsed;
            }

            if (!this.props.scrapeBot.processing && this.props.scrapeBot.next_run != 0 && this.props.scrapeBot.enabled)
            {
                timeUntilNext = Math.round( this.props.scrapeBot.next_run - (Date.now() / 1000) );
            }
            else
            {
                timeUntilNext = 0;
            }


            this.setState( {
                timeElapsed : timeElapsed,
                timeUntilNext : timeUntilNext

            } )

        }, 1000)
    }

    stopInterval()
    {
        if (this.counterLoop != null)
        {
            clearInterval(this.counterLoop);
            this.counterLoop = null;
        }
    }

    botIsEnabled()
    {
        return this.props.scrapeBot.enabled;
    }

    botIsWorking()
    {
        return this.props.scrapeBot.processing;
    }

    renderJobButtons()
    {

        return <div className="manager-buttonColumn">

                <div    onClick={ () =>!this.botIsEnabled() ?   this.props.toggleScrapebot(true)    : {} } 
                        className={    !this.botIsEnabled() ?   styles.manageButton : styles.manageButtonDisabled }>Start bot</div>
                <div    onClick={ () => this.botIsEnabled() ?   this.props.toggleScrapebot(false)   : {} } 
                        className={     this.botIsEnabled() ?   styles.manageButton : styles.manageButtonDisabled }>Stop bot</div>
                <div    onClick={ () => this.botIsEnabled() && !this.botIsWorking() ?  this.props.scrapeBotScrapeNow()    : {} } 
                        className={     this.botIsEnabled() && !this.botIsWorking() ? styles.manageButton : styles.manageButtonDisabled }>Scrape now</div>
             </div>
        
    }

    job()
    {

        return <div className="manager-infoColumnContainer"> 
                    <table className="manager-infoColumn">   
                        <tbody>          
                            {this.numberEntry('Interval: ',        this.props.scrapeBot.interval, 
                                                                    (num : number) => { this.props.setScrapeBotInterval(num)  } )}
                            {this.numberEntry('Concurrent Requests: ',  this.props.scrapeBot.concurrent_requests, 
                                                                        (num : number) => { this.props.setScrapeBotConcurrentRequests(num) } )}

                            {this.simpleEntry('Progress: ',        this.getWorklistProgressString())}
                            {this.numberEntry('Elapsed: ',           this.state.timeElapsed ) }
                            {this.simpleEntry('Status: ',           this.props.scrapeBot.processing ? 'Working' : 'Finished')}
                            {this.numberEntry('Next: ',           this.state.timeUntilNext ) }
                        </tbody>
                    </table>
                </div>
        
    }

    getTimeDisplayString( time : number)
    {
        if (time == null)
        {
            return "N/A"
        }
        else
        {
            return new Date(time * 1000).toUTCString();
        }
    }

    getWorklistProgressString()
    {
        let processed = this.props.scrapeBot.worklist_total - (this.props.scrapeBot.worklist_remaining + this.props.scrapeBot.worklist_active) ;
        return `${processed} / ${this.props.scrapeBot.worklist_total}` ;
    }

    simpleEntry(name : string, content : any)
    {
       return <tr className="manager-infoContainer">
                    <td className="manager-infoNameCol">   {name}  </td>
                    <td className="manager-infoContentCol">  {content} </td> 

                    <td  className="manager-infoButtonCol"/>   
                </tr>
    }

    numberEntry(name : string, num : number, callback? : (num : number) => void )
    {

       return <tr className="manager-infoContainer">
                    <td className="manager-infoNameCol">   {name}  </td>
                    <td className="manager-infoContentCol">  { num } </td>

                    {
                        callback != null ? 
                            <td className="manager-infoButtonCol">
                            <component.scrapeBot.cells.numberInputPopup
                                defaultValue = {num}
                                fieldName = {name}
                                onSave = { callback}
                                trigger = { <div className={ styles.infoButton }> edit </div> }
                            
                            /> </td>
                            :
                            <td  className="manager-infoButtonCol"/> 
                    }

                    
                </tr>
    }


};
