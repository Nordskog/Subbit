import * as React from 'react';


import Popup from "reactjs-popup";

import * as styles from 'css/subredditList.scss'
import * as animationStyles from 'css/animations.scss'

import * as components from '~/client/components/'
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

import * as transitions from 'react-transition-group'

interface Props 
{
    trigger : JSX.Element;
    items: components.tools.SearchList.SearchItem[] | components.tools.SearchList.SearchItem;
}

interface State
{
    
}



export default class popup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    public render()
    {
        let style = 
        {
            'width': 'auto',
            'border': '0px',
            'padding': '0px',
            'background': 'transparent'
        }

        let overlayStyle =
        {
            'background': '#00000080',
            'animation': animationStyles.fadeIn+" 0.5s"
        }

            return <Popup   trigger={ this.props.trigger } 
                            contentStyle={style} 
                            position="bottom left" closeOnDocumentClick
                            arrow={false}
                            overlayStyle={overlayStyle}
                                                >
                        {
                            close => 
                            {
                                 return <transitions.TransitionGroup >
                                            <components.transitions.Fade key={'subreddit_popup'} appear={true}>
                                                <div className={styles.popupContainer}>
                                                    <components.tools.SearchList.component
                                                        items={this.props.items} 
                                                        onClick={ ( item) => close() }
                                                        onAltClick={ ( item) => close() }
                                                    />
                                                </div>
                                            </components.transitions.Fade>
                                         </transitions.TransitionGroup>
                            }
                        }
                    </Popup>
    }
};
