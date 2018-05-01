import * as React from 'react';
import { Link } from 'react-router-dom';

import * as component from '~/client/components/'
import * as models from '~/common/models';

import * as styles from 'css/manager.scss'

import * as Toastify from 'react-toastify'

interface Props 
{
    addSubreddit( subreddit: string  ) : void;
}

interface State
{
    
}

export default class managedSettingsComponent extends React.Component<Props, State >
{

    public render()
    {
        return  <div className={ styles.container }>
                    <div className={ styles.settingsContainer }>
                        <div className={ styles.actionsContainer }>
                            <component.settings.cells.subredditInputPopup
                                trigger={ <div className={ styles.manageButton }> Add Subreddit </div>  }
                                onSave={ ( subreddit) => this.addSubreddit(subreddit) } />

                                    <div className={ styles.manageButton } onClick={ () => Toastify.toast("Hello world") }> Add Subreddit 
                                    </div>
                        </div>
                    </div>
                </div>
    }


    
    addSubreddit(subreddit : string)
    {
        if (subreddit.length > 0)
        {
            this.props.addSubreddit(subreddit);
        }
    }


};
