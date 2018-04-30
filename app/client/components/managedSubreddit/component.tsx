import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/manager.scss'

import * as component from '~/client/components/'
import * as models from '~/common/models';
import * as serverActions from '~/backend/actions'

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

interface Props 
{
    subreddit: models.data.Subreddit;
    requestScrape(request : serverActions.scrape.REQUEST_SCRAPE) : void;
    updateJob(modifiedJob: models.data.ScrapeJob ) : void;
    cancelJob( job: number) : void;
    removeSubreddit ( subreddit: models.data.Subreddit  ) : void;

    pruneAuthorsWithNoPosts( subreddit_id : number ) : void;
    updatePostHotScore( subreddit_id : number  ) : void;
    updateAuthorHotScoreFromPosts( subreddit_id : number  ) : void;
    setSubredditAutoscrape( subreddit_id : number, enabled : boolean) : void;
}

interface State
{
    expanded : boolean;
}

export default class managedSubreddit extends React.Component<Props, State >
{

    constructor( props : Props)
    {
        super(props);
        this.state = {
            expanded: false
        }
    }

    public render()
    {
        
        return  <div className="manager-subreddit">
                    <div className="manager-nameContainer">     r/{this.props.subreddit.name}     
                    
                        <div className={styles.expandButtonContainer} onClick={ () => this.state.expanded ? this.collapse() : this.expand()  }>
                            <svg className={styles.expandButton}  >
                                <use xlinkHref={ this.state.expanded ? collapse_caret : expand_caret}></use>
                            </svg>
                        </div>
                        
                    </div>

                    <div className="manager-columnContainer">
                        {this.job()}
                        {this.renderJobButtons()}
                    </div>




                </div>
    }

    jobIsActive() : boolean
    {
        return this.props.subreddit.scrape_job.status == models.ScrapeStatus.WORKING;
    }

    jobIsModified() : boolean
    {
        return this.props.subreddit.scrape_job.status == models.ScrapeStatus.MODIFIED;
    }

    renderJobButtons()
    {
        if (this.state.expanded)
        {
            return <div className="manager-buttonColumn">
                <div 
                    onClick={ () => this.jobIsModified() ? this.requestSubredditScrape() : {} } 
                    className={ this.jobIsModified() ? styles.manageButton : styles.manageButtonDisabled }
                    >Run Job
                </div>

               <div 
                    onClick={ () => this.jobIsActive() ? this.cancelJob() : {} } 
                    className={ this.jobIsActive() ? styles.manageButton : styles.manageButtonDisabled }
                    >Cancel Job   
                </div>
               <component.tools.confirmationPopup   
                    trigger={<div className={ styles.manageButton }>     Delete Subreddit    </div>}
                    message='Are you sure?'
                    title='Delete subreddit'
                    positiveButton='Delete'
                    negativeButton='Cancel'
                    onSave={ (ok) => { if (ok) this.props.removeSubreddit( this.props.subreddit ); } } />

                <component.tools.confirmationPopup   
                    trigger={<div className={ styles.manageButton }> Update post hot scores </div>}
                    title='Update post hot scores'
                    message='This might take a while'
                    positiveButton='Ok'
                    negativeButton='Cancel'
                    onSave={ (ok) => { if (ok) this.props.updatePostHotScore( this.props.subreddit.id ); } } />

                <component.tools.confirmationPopup   
                    trigger={<div className={ styles.manageButton }> Update author hot scores </div>}
                    title='Update author hot scores'
                    message='This might take a while'
                    positiveButton='Ok'
                    negativeButton='Cancel'
                    onSave={ (ok) => { if (ok) this.props.updateAuthorHotScoreFromPosts( this.props.subreddit.id ); } } />

                <div 
                    onClick={ () => !this.props.subreddit.autoscrape ? this.props.setSubredditAutoscrape(this.props.subreddit.id,true) : {} } 
                    className={ !this.props.subreddit.autoscrape  ? styles.manageButton : styles.manageButtonDisabled }
                    >Enable Autoscrape  
                </div>

                <div 
                    onClick={ () => this.props.subreddit.autoscrape ? this.props.setSubredditAutoscrape(this.props.subreddit.id,false) : {} } 
                    className={ this.props.subreddit.autoscrape  ? styles.manageButton : styles.manageButtonDisabled }
                    >Disable Autoscrape  
                </div>

            
            </div>

        }
        else
        {
            return ''
        }
    }

    expand()
    {
        this.setState(  { expanded : true } );
    }

    collapse()
    {
        this.setState(  { expanded : false } );
    }

    job()
    {
        if (this.props.subreddit.scrape_job != null)
        {
            if (this.state.expanded)
            {
                return <div className="manager-infoColumnContainer"> 
                            <table className="manager-infoColumn">   
                                <tbody>          
                                    {this.timeEntry('Job start: ',          this.props.subreddit.scrape_job.job_start_time)}
                                    {this.timeEntry('Scrape from: ',        this.props.subreddit.scrape_job.scrape_from_time, 
                                                                            (time : number) => { this.modifyJobTime(time, this.props.subreddit.scrape_job.scrape_to_time) } )}
                                    {this.timeEntry('Scrape to: ',          this.props.subreddit.scrape_job.scrape_to_time,
                                                                            (time : number) => { this.modifyJobTime(this.props.subreddit.scrape_job.scrape_from_time, time) } )}
                                    {this.timeEntry('Oldest post: ',        this.props.subreddit.scrape_job.last_post_time)}
                                    {this.sourceEntry('Source: ',           this.props.subreddit.scrape_job.job_type)}
                                    {this.simpleEntry('Posts: ',            this.props.subreddit.scrape_job.processed_count)}
                                    {this.simpleEntry('Status: ',           this.props.subreddit.scrape_job.status)}
                                </tbody>
                            </table>
                        </div>
            }
            else
            {
                return <div className="manager-infoColumnContainer"> 
                            <table className="manager-infoColumn">
                                <tbody>   
                                    {this.simpleEntry('Status: ',           this.props.subreddit.scrape_job.status)}
                                </tbody>   
                            </table>
                            
                        </div>
            }
        }
        else
        {
            return <div className="manager-infoColumn"/>
        }
    }

    requestSubredditScrape()
    {
        let payload : serverActions.scrape.REQUEST_SCRAPE =
        {
            scrape_from_time: this.props.subreddit.scrape_job.scrape_from_time,
            scrape_to_time: this.props.subreddit.scrape_job.scrape_to_time,
            scrape_type: this.props.subreddit.scrape_job.job_type,
            subreddit: this.props.subreddit.name
        }

        this.props.requestScrape(payload);
    }

    cancelJob()
    {
        this.props.cancelJob(this.props.subreddit.scrape_job.id);
    }

    modifyJobTime(from : number, to : number)
    {
        console.log("modifying time");

        let job =
        {
            ...this.props.subreddit.scrape_job,
            scrape_from_time: from,
            scrape_to_time : to,
            subreddit :
            {
                id: this.props.subreddit.id
            }
        }

        this.props.updateJob(job);
    }

    simpleEntry(name : string, content : any)
    {
       return <tr className="manager-infoContainer">
                    <td className="manager-infoNameCol">   {name}  </td>
                    <td className="manager-infoContentCol">  {content} </td> 

                    <td  className="manager-infoButtonCol"/>   
                </tr>
    }

    timeEntry(name : string, time : number, callback? : (time : number) => void )
    {

       return <tr className="manager-infoContainer">
                    <td className="manager-infoNameCol">   {name}  </td>
                    <td className="manager-infoContentCol">  { this.getTimeDisplayString(time) } </td>

                    {
                        callback != null ? 
                            <td className="manager-infoButtonCol">
                            <component.managedSubreddit.cells.timeWidget
                                configured_time = {time}
                                from_time = {this.props.subreddit.scrape_job.scrape_from_time}
                                to_time = {this.props.subreddit.scrape_job.scrape_to_time}
                                last_time = {this.props.subreddit.scrape_job.last_post_time}
                                onSave = { callback}
                                trigger = { <div className={ styles.infoButton }> edit </div> }
                            
                            /> </td>
                            :
                            <td  className="manager-infoButtonCol"/> 
                    }

                    
                </tr>
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

    sourceEntry(name : string, content : any)
    {
       return <tr className="manager-infoContainer">
                    <td className="manager-infoNameCol">   {name}  </td>
                    <td className="manager-infoContentCol">  {content} </td>
                    
                    <td className="manager-infoButtonCol">
                        <component.managedSubreddit.cells.jobTypeWidget
                            selected = {this.props.subreddit.scrape_job.job_type}
                            onSave = { ( type : models.ScrapeType ) => this.modifyJobType(type) }
                            trigger = { <div className={ styles.infoButton }> edit </div> }
                        
                        />
                    
                    </td>
                    
                </tr>
    }

    modifyJobType(type : models.ScrapeType)
    {
        let job =
        {
            ...this.props.subreddit.scrape_job,
            job_type: type,
            subreddit :
            {
                id: this.props.subreddit.id
            }
        }

        this.props.updateJob(job);
    }

};
