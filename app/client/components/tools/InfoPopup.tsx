import * as React from 'react';
import Popup from "reactjs-popup";
import * as components from '~/client/components'
import * as transitions from 'react-transition-group'

import * as siteStyles from 'css/site.scss'

interface Props
{
    text : string;
    trigger: JSX.Element;
}

interface State
{

}

export default class InfoPopup extends React.Component<Props, State>
{
    public render()
    {
        let style = 
        {
            'width': 'auto',
            'border': '0px',
            'background':'transparent',
            'overflow': 'visible',
            'margin' : "0px",
            'padding' : "0px"
        }

        let arrowStyle = 
        {
            "top":"10px",
            "background": "#141c26",                //must match $input-background-color
            "borderRight": "1px solid #898989",     //Must match $normal-text-color
            "borderBottom": "1px solid #898989",    //must match $normal-text-color
            "z-index": "99999"
        }


        return <Popup   trigger={ this.props.trigger } 
                        contentStyle={style} 
                        position="top left" closeOnDocumentClick
                        on={"hover"}
                        arrow={true}
                        arrowStyle={arrowStyle}
                                            >
                    {
                        close => 
                        {
                                return <transitions.TransitionGroup >
                                            <div className={siteStyles.InfoPopup}>
                                                {this.props.text}
                                            </div>
                                        </transitions.TransitionGroup>
                        }
                    }
                </Popup>
    }
}