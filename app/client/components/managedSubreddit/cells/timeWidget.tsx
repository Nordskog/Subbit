import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/timewidget.scss'

import * as siteStyles from 'css/site.scss'
import * as managerStyles from 'css/manager.scss'

import * as component from '~/client/components/'
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

interface Props 
{
    configured_time : number;
    from_time: number;
    to_time: number;
    last_time : number;
    onSave(time : number) : void;
    trigger : JSX.Element;
}

interface State
{
    configured_time : number;
}

interface TimeChange
{

    years? : number,
    months? : number,
    days? : number,
    hours? : number,
    minutes? : number,
    seconds? : number
}

export default class timeWidget extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);

        this.state = { configured_time: (props.configured_time == null ? Date.now() / 1000 : props.configured_time) };
    }

    public render()
    {
        let style = 
        {
            'maxWidth': '500px',
            'minWidth': '360px',
            'border': '0px',
            'background':'transparent'
        }

            return <Popup   trigger={ this.props.trigger } 
                            contentStyle={style}

                        position="top center" closeOnDocumentClick modal>

                        {
                            close => 
                            {
                                return <div className={ styles.container }>
                                <div className={ styles.displayContainer }>
                                    <div className={ styles.timeDisplay }>
                                        { this.getTimeDisplay( this.state.configured_time ) }
                                    </div>
                                </div>
    
                                <div className={ styles.rowContainer }>
                                    <div className={ styles.row }>
                                        {this.getSetTimeButton('Scrape from time',  () => this.props.from_time )}
                                        {this.getSetTimeButton('Scrape to time',    () => this.props.to_time )}
                                    </div>
                                    <div className={ styles.row }>
                                        {this.getSetTimeButton('Current time',      () => Date.now() / 1000 )}
                                        {this.getSetTimeButton('Oldest post time',  () => this.props.last_time )}
                                        {this.getSetTimeButton('Beginning of time',  () => 0 )}
                                    </div>
    
                                </div>
    
                              <div className={ styles.buttonContainer }>
                                    <div onClick={ () => 
                                    {  
                                        this.props.onSave(this.state.configured_time);
                                        close();
                                                                     
                                    } } className={ styles.saveButton }>Save</div>
                                    <div onClick={ () => close() } className={ styles.cancelButton }>Cancel</div>
                                </div>
    
                            </div>
                            }
                        }

                    </Popup>
    }

    getTimeDisplay(time : number)
    {
        let date : Date = new Date(time * 1000);
        let fields : string[] = date.toUTCString().replace(',','').split(/\s|:/);

        return <div className={ styles.timeDisplay }>

                     { this.getTimeField( fields[0], null, null, true)}

                    { this.getTimeField( fields[1], 
                        {days: 1}, {days: -1}) }

                    { this.getTimeField( fields[2], 
                        {months: 1}, {months: -1}, true) }

                    { this.getTimeField( fields[3], 
                        {years: 1}, {years: -1}) }

                    { this.getTimeField( fields[4], 
                        {hours: 1}, {hours: -1}) }

                    <span className={ styles.timeSpacer }> : </span>

                    { this.getTimeField( fields[5], 
                        {minutes: 1}, {minutes: -1}) }

                    <span className={ styles.timeSpacer }> : </span>

                    { this.getTimeField( fields[6], 
                        {seconds: 1}, {seconds: -1}) }

                    { this.getTimeField( fields[7]) }
                </div>
    }

    getTimeField(content : string, upTimeChange : TimeChange = null, downTimeChange : TimeChange = null, useFixedBox : boolean = false)
    {
        return <div className={ useFixedBox ? styles.fixedTimeCell : styles.timeCell } > 

        {
            upTimeChange != null && downTimeChange != null ?
            <svg className={ styles.timeButton } onClick={ () => this.adjustTime( upTimeChange ) } >
                <use xlinkHref={collapse_caret}></use>
            </svg> : ''
        }

            <div className={ styles.timeContent } > {content} </div>  

        {
            upTimeChange != null && downTimeChange != null ?
            <svg className={ styles.timeButton } onClick={ () => this.adjustTime( downTimeChange ) } >
                <use xlinkHref={expand_caret}></use>
            </svg> : ''
        }
        
         </div>
    }

    getSetTimeButton( content : string, onClick : () => number )
    {
        return <div className={ styles.cell }> <div onClick={ () => this.setTime( onClick() ) } className={ styles.button }> {content} </div> </div>
    }

    adjustTime( change : TimeChange )
    {
        let date : Date = new Date( this.state.configured_time * 1000 );
        if (change.years != null)
        {
            date.setUTCFullYear( date.getUTCFullYear() + change.years );
        }

        if (change.months != null)
        {
            date.setUTCMonth( date.getUTCMonth() + change.months );
        }

        if (change.days != null)
        {
            date.setUTCDate( date.getUTCDate() + change.days );
        }

        if (change.hours != null)
        {
            date.setUTCHours( date.getUTCHours() + change.hours );
        }

        if (change.minutes != null)
        {
            date.setUTCMinutes( date.getUTCMinutes() + change.minutes );
        }

        if (change.seconds != null)
        {
            date.setUTCSeconds( date.getUTCSeconds() + change.seconds );
        }

        this.setState( { configured_time : date.getTime() / 1000} );
    }

    setTime(time : number)
    {
        this.setState( { configured_time : time} );
    }
};
