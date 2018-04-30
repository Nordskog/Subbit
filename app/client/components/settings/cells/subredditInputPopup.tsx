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
    onSave( subreddit : string) : void;
    trigger : JSX.Element;
}

interface State
{
    
}



export default class subredditInputPopup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    textValue : string = '';

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
                                    <div className={ styles.nameRow }>
                                        <span className={styles.nameContainer}> r/ </span>
                                         <input onChange={ evt => { this.textValue = evt.target.value } } type="text" className={ styles.inputContainer }/>
                                    </div>
                                    <div className={ styles.buttonContainer }>
                                        <div onClick={ () => 
                                            {
                                               this.props.onSave(this.textValue)
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
