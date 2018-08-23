import * as React from 'react';
import * as components from '~/client/components';

import AsyncStats from '~/client/components/stats/async';

import * as Toastify from 'react-toastify';
import * as models from '~/common/models';

import * as styles from 'css/site.scss';
import { MessageType } from '~/client/components/tools';

interface Props
{
    siteMode : models.SiteMode;
    authenticated: boolean;
    subscriptionCount: number;
    filter: models.AuthorFilter;
}
 
export default class App extends React.Component<Props,any>
{
    public render()
    {
      return <div>
                <Toastify.ToastContainer/>
                <div className={styles.siteContainer}>
                    <components.header/>
                    <div className={styles.contentOuterContainer}>
                        <div className={styles.contentContainer}>
                            {this.getContent()}
                        </div>
                    </div>
                </div>

                    
             </div>;
    }

    private getContent()
    {   

        switch( this.props.siteMode )
        {
            case models.SiteMode.STATS:
                return this.getStats();

            case models.SiteMode.ABOUT:
                return <components.tools.Message message={MessageType.ABOUT} />;

            case models.SiteMode.PRIVACY:
                return <components.tools.Message message={MessageType.PRIVACY} />;

            case models.SiteMode.WAITING:
                return <components.tools.Message message={MessageType.WAITING} />;
        }

        if (this.props.filter === models.AuthorFilter.SUBSCRIPTIONS  )
        {
            if ( !this.props.authenticated)
            {
                return <components.tools.Message 
                 message={MessageType.NOT_LOGGED_IN}
                />;
            }
            else if (  this.props.subscriptionCount < 1)
            {
                return <components.tools.Message 
                            message={MessageType.NO_SUBSCRIPTIONS}
                />;
            }
        }

        return this.getAuthors();

    }

    private getAuthors()
    {
        return [    <components.authors key={"authors"} />,
                    <components.tools.scrollEndDetector key={"scrollEndDetector"} />,
                    <components.tools.LoadingStatus key={"LoadingStatus"} />
               ];
    }

    private getStats()
    {
        return <AsyncStats
        />;
    }


}
