import * as React from 'react';
import * as models from '~/common/models'
import * as components from '~/client/components'

import Component from './container';
import { ToggleItem } from '~/client/components/tools';

import Popup from "reactjs-popup";
import * as transitions from 'react-transition-group'

import * as styles from 'css/userSettings.scss'
import * as animationStyles from 'css/animations.scss';
import * as headerStyles from 'css/header.scss'



export default class popup extends React.Component<null, null>
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

        let trigger = <div className={headerStyles.sortButton}>Settings</div>;

        return <Popup   trigger={ trigger } 
                        contentStyle={style} 
                        position="bottom right" closeOnDocumentClick
                        arrow={false}
                        overlayStyle={overlayStyle}
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
