import * as React from 'react';

import * as styles from 'css/searchList.scss';

import * as components from '~/client/components/';


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
