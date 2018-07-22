import * as React from 'react';
import * as components from '~/client/components'
import * as transitions from 'react-transition-group'

import * as siteStyles from 'css/site.scss'

import * as animationStyles from 'css/animations.scss'

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
        return <components.tools.Popup.Component
            trigger={this.props.trigger }
            hover={true}
            showBackground={true}
            hoverAppearDelay={0.3}
            position={ components.tools.Popup.Position.TOP}
            alignment={ components.tools.Popup.Alignment.BEGINNING }>
        {
            close => 
            {
                    return  <div className={siteStyles.InfoPopup}>
                                {this.props.text}
                                <div className={siteStyles.infoPopupArrow} />
                            </div>
            }
        }

        </components.tools.Popup.Component>
    }
}