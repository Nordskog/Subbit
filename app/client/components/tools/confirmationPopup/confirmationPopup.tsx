import * as React from 'react';


import * as styles from 'css/confirmationPopup.scss';
import * as components from '~/client/components/';

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



export default class ConfirmationPopup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    private textValue : string = '';

    public getTitle()
    {
        if (this.props.title != null)
        {
            return <span className={styles.titleContainer}> {this.props.title} </span>;
        }
    }

    public getMessage()
    {
        if (this.props.message != null)
        {
            return <span className={styles.messageContainer}> {this.props.message} </span>;
        }
    }

    private getPositiveButton( close : () => void)
    {
        if (this.props.positiveButton != null)
        {
            return <div onClick={ () => 
                {
                   this.props.onSave(true);
                   close(); 
                } } className={ styles.saveButton }>{this.props.positiveButton}</div>;
        }
    }

    private getNegativeButton( close : () => void)
    {
        if (this.props.positiveButton != null)
        {
            return <div onClick={ () => {
                this.props.onSave(false);
                close(); 
            } } className={ styles.cancelButton }>{this.props.negativeButton}</div>;
        }
    }

    public render()
    {
            return <components.tools.Popup.Component 
                            trigger={ this.props.trigger } 
                            modal={true} >
                        {
                            (close) => 
                            {
                                return <div className={ styles.container }>
                                    {this.getTitle()}
                                    {this.getMessage()}
                                    <div className={ styles.buttonContainer }>
                                        {this.getPositiveButton(close)}
                                        {this.getNegativeButton(close)}
                                    </div>
                                </div>;
                            }
                        }


                    </components.tools.Popup.Component >;
    }
}
