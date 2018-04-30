import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/timewidget.scss'

import * as siteStyles from 'css/site.scss'
import * as managerStyles from 'css/manager.scss'

import * as component from '~/client/components/'
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'



interface Props 
{
    selected : models.ScrapeType;
    onSave(selected : string) : void;
    trigger : JSX.Element;
}

interface State
{
   selected : models.ScrapeType;
}

export default class timeWidget extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);

        this.state = { selected: props.selected };
    }

    public render()
    {
        let style = 
        {
            'max-width': '150px',
            'min-width': '150px',
            'border': '0px',
            'background':'transparent'
        }

            return <Popup   trigger={ this.props.trigger } 
                        position="right center" closeOnDocumentClick
                        contentStyle={style} 
                        >
                        {
                            close => (

                                <div className={ managerStyles.jobTypeContainer }>
                                    <div onClick={ () => this.select(models.ScrapeType.REDDIT, close) }  className={managerStyles.jobTypeItem}> reddit </div>
                                    <div onClick={ () => this.select(models.ScrapeType.PUSHSHIFT, close) }  className={managerStyles.jobTypeItem}> pushshift </div>
                                </div>
    
                            )
                        }

                    </Popup>
    }

    select(type : models.ScrapeType, close : () => void)
    {
        close();
        this.props.onSave(type);
    }


};
