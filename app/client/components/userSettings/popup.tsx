import * as React from 'react';
import * as components from '~/client/components';

import Component from './container';

import * as styles from 'css/userSettings.scss';

import SVGInline from "react-svg-inline";
import * as settings_icon from 'assets/images/settings_icon.svg';

interface Props
{
    mobile : boolean;
}

export default class Popup extends React.Component<Props, null>
{

    public render()
    {
        let trigger =   <div className={styles.headerButtonContainer}>
                            <SVGInline className={styles.button} svg={settings_icon}/>
                        </div>;

        
        // On mobile the menu button may jump down below the menu bar,
        // so instead of relying on the position parameter, we will hardcode
        // the offset from the top of the screen.
        let position = components.tools.Popup.Position.BOTTOM;
        let clazz = null;

        if (this.props.mobile)
        {
            position = null;
            clazz = styles.mobilePopupPositioner;
        }

        return <components.tools.Popup.Component
            trigger={trigger}
            modal={false}  
            fullscreen={this.props.mobile}
            position={position}
            contentClass={clazz}
            alignment={ components.tools.Popup.Alignment.END }>
            {
                (close) => 
                {
                        return <div >
                                    <div className={styles.popupContainer}>
                                        <Component 
                                            close={close}
                                        />
                                    </div>
                                </div>;
                }
            }
      </components.tools.Popup.Component>;

    }
}
