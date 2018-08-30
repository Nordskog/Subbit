import * as React from 'react';
import * as components from '~/client/components';
import * as siteStyles from 'css/site.scss';

import MediaQuery from 'react-responsive';

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
        // Mobile doesn't handle hover out events at all.
        // Disable on mobile.
        return <MediaQuery query="screen and (max-width: 1100px)">
        {
            (matches : boolean) => 
            {
                if (matches)
                {
                    return this.props.trigger;
                }
                else
                {
                    return <components.tools.Popup.Component
                        trigger={this.props.trigger }
                        hover={true}
                        showBackground={true}
                        hoverAppearDelay={0.3}
                        position={ components.tools.Popup.Position.TOP}
                        alignment={ components.tools.Popup.Alignment.BEGINNING }>
                    {
                        (close) => 
                        {
                                return  <div className={siteStyles.InfoPopup}>
                                            {this.props.text}
                                            <div className={siteStyles.infoPopupArrow} />
                                        </div>;
                        }
                    }
            
                    </components.tools.Popup.Component>;
                }
            } 
        }
        </MediaQuery>;



    }
}
