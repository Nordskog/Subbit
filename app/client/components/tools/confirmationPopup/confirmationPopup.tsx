import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/confirmationPopup.scss'

import * as component from '~/client/components/'
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

interface Props 
{
    onSave( ok : boolean) : void;
    title? : string;
    message? : string;
    positiveButton?: string;
    negativeButton? : string;
    trigger : JSX.Element;
}

interface State
{
    
}



export default class confirmationPopup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    textValue : string = '';

    public getTitle()
    {
        if (this.props.title != null)
        {
            return <span className={styles.titleContainer}> {this.props.title} </span>
        }
    }

    public getMessage()
    {
        if (this.props.message != null)
        {
            return <span className={styles.messageContainer}> {this.props.message} </span>
        }
    }

    getPositiveButton( close : () => void)
    {
        if (this.props.positiveButton != null)
        {
            return <div onClick={ () => 
                {
                   this.props.onSave(true)
                   close(); 
                } } className={ styles.saveButton }>{this.props.positiveButton}</div>
        }
    }

    getNegativeButton( close : () => void)
    {
        if (this.props.positiveButton != null)
        {
            return <div onClick={ () => {
                this.props.onSave(false)
                close() 
            } } className={ styles.cancelButton }>{this.props.negativeButton}</div>
        }
    }

    public render()
    {
        let style = 
        {
            'width': '250px',
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
                                    {this.getTitle()}
                                    {this.getMessage()}
                                    <div className={ styles.buttonContainer }>
                                        {this.getPositiveButton(close)}
                                        {this.getNegativeButton(close)}
                                    </div>
                                </div>
                            }
                        }


                    </Popup>
    }
};
