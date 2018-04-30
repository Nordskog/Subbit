import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/subredditInputPopup.scss'

import * as component from '~/client/components/'
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

interface Props 
{
    onSave( num : number) : void;
    defaultValue : number;
    fieldName : string;
    trigger : JSX.Element;
}

interface State
{
    
}



export default class numberInputPopup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    numberValue : number = 0;

    public render()
    {

        let style = 
        {
            'width': 'auto',
            'minWidth': '250px',
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
                                    <div className={ styles.nameColumn }>
                                        <span className={styles.nameContainer}>{this.props.fieldName}</span>
                                         <input defaultValue={String(this.props.defaultValue)} onChange={ 
                                                evt => { this.numberValue = Number.parseInt(evt.target.value) } } 
                                                type="number" 
                                                className={ styles.numberInputContainer }/>
                                    </div>
                                    <div className={ styles.buttonContainer }>
                                        <div onClick={ () => 
                                            {
                                               this.props.onSave(this.numberValue)
                                               close(); 
                                            } } className={ styles.saveButton }>Save</div>
                                        <div onClick={ () => close() } className={ styles.cancelButton }>Cancel</div>
                                    </div>
                                </div>
                            }
                        }


                    </Popup>
    }
};
