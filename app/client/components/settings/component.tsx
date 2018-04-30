import * as React from 'react';
import { Link } from 'react-router-dom';

import * as component from '~/client/components/'
import * as models from '~/common/models';

import * as styles from 'css/manager.scss'

import * as Toastify from 'react-toastify'

interface Props 
{
    addSubreddit( subreddit: string  ) : void;
    pruneAuthorsWithNoPosts( ) : void;
    updatePostHotScore( ) : void;
    updateAuthorHotScoreFromPosts( ) : void;
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

                                <component.tools.confirmationPopup   trigger={<div className={ styles.manageButton }> Prune authors with no posts </div>}

                                        title='Prune Authors'
                                        message='Any associated subscriptions will also be deleted'
                                        positiveButton='Ok'
                                        negativeButton='Cancel'
                                        onSave={ (ok) => { if (ok) this.props.pruneAuthorsWithNoPosts( ); } } />

                                <component.tools.confirmationPopup   trigger={<div className={ styles.manageButton }> Update post hot scores </div>}
                                        title='Update post hot scores'
                                        message='This might take a while'
                                        positiveButton='Ok'
                                        negativeButton='Cancel'
                                        onSave={ (ok) => { if (ok) this.props.updatePostHotScore( ); } } />

                                <component.tools.confirmationPopup   trigger={<div className={ styles.manageButton }> Update author hot scores </div>}
                                        title='Update author hot scores'
                                        message='This might take a while'
                                        positiveButton='Ok'
                                        negativeButton='Cancel'
                                        onSave={ (ok) => { if (ok) this.props.updateAuthorHotScoreFromPosts( ); } } />

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
