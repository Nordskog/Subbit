import * as React from 'react';
import * as models from '~/common/models'
import * as components from '~/client/components'

import Component from './container';
import { ToggleItem } from '~/client/components/tools';

import Popup from "reactjs-popup";
import * as transitions from 'react-transition-group'

import * as styles from 'css/userSettings.scss'
import * as animationStyles from 'css/animations.scss';

import settings_icon from 'assets/images/settings_icon.svg'

interface Props
{
    mobile : boolean;
}

export default class popup extends React.Component<Props, null>
{

    public render()
    {
        let style = 
        {
            'width': 'auto',
            'border': '0px',
            'padding': '0px',
            'background':'transparent'
        }

        let overlayStyle =
        {
            'background': '#00000080',
            'animation': animationStyles.fadeIn+" 0.5s"
        }

        let trigger =   <svg className={styles.button} >
                            <use xlinkHref={settings_icon}></use>
                        </svg>;

        console.log("modal: ",this.props.mobile);

        return <Popup   trigger={ trigger } 
                        contentStyle={style} 
                        position="bottom right" closeOnDocumentClick
                        arrow={false}
                        overlayStyle={overlayStyle}
                        modal={this.props.mobile}
                                            >
                    {
                        close => 
                        {
                                return <transitions.TransitionGroup >
                                        <components.transitions.Fade key={'userSettingsPopup'} appear={true}>
                                            <div className={styles.popupContainer}>
                                                <Component />
                                            </div>
                                        </components.transitions.Fade>
                                        </transitions.TransitionGroup>
                        }
                    }
                </Popup>
    }
};
