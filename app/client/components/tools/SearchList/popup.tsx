import * as React from 'react';


import * as styles from 'css/subredditList.scss';
import * as animationStyles from 'css/animations.scss';

import * as components from '~/client/components/';
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg';
import collapse_caret from 'assets/images/collapse_caret.svg';

import * as transitions from 'react-transition-group';

interface Props 
{
    trigger : JSX.Element;
    items: components.tools.SearchList.SearchItem[] | components.tools.SearchList.SearchItem;
    position?: components.tools.Popup.Position;
    alignment?: components.tools.Popup.Alignment;
    overlayClass? : string;
    contentClass? : string;
    modal?: boolean;
}

interface State
{
    
}



export default class Popup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    public render()
    {
        let modal = this.props.modal != null ? this.props.modal : false;

        return <components.tools.Popup.Component
            trigger={this.props.trigger}
            modal={false}  
            fullscreen={modal}
            position={ this.props.position}
            alignment={ this.props.alignment }
            overlayClass={this.props.overlayClass}
            contentClass={this.props.contentClass}
            >
  
            {
                (close) => 
                {
                    return <div >
                        <div className={modal ? styles.modalPopupContainer : styles.popupContainer}>
                            <components.tools.SearchList.component
                                items={this.props.items} 
                                onClick={ ( item) => { close(); return true; } }
                                onAltClick={ ( item) =>  { close(); return true; } }
                            />
                        </div>
                 </div>;
                }
            }
        </components.tools.Popup.Component>;
    }
}
