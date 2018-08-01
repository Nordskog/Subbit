import * as React from 'react';
import * as components from '~/client/components';

import AsyncStats from '~/client/components/stats/async'

import * as Toastify from 'react-toastify'
import * as models from '~/common/models'

import * as styles from 'css/site.scss'
import { MessageType } from '~/client/components/tools';

interface Props
{
    siteMode : models.SiteMode,
    authenticated: boolean;
    subscriptionCount: number;
    filter: models.AuthorFilter;
}
 
export default class app extends React.Component<Props,any>
{
    render()
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

                    
             </div>
    }

    getContent()
    {   
        if (this.props.siteMode == models.SiteMode.STATS )
        {
            return this.getStats();
        }

        if (this.props.siteMode == models.SiteMode.ABOUT)
        {
            return <components.tools.Message 
                        message={MessageType.ABOUT}
                    />
        }

        if (this.props.siteMode == models.SiteMode.PRIVACY)
        {
            return <components.tools.Message 
                        message={MessageType.PRIVACY}
                    />
        }

        if (this.props.filter == models.AuthorFilter.SUBSCRIPTIONS  )
        {
            if ( !this.props.authenticated)
            {
                return <components.tools.Message 
                 message={MessageType.NOT_LOGGED_IN}
                />
            }
            else if (  this.props.subscriptionCount < 1)
            {
                return <components.tools.Message 
                            message={MessageType.NO_SUBSCRIPTIONS}
                />
            }
        }

        return this.getAuthors();

    }

    getAuthors()
    {
        return [    <components.authors key={"authors"} />,
                    <components.tools.scrollEndDetector key={"scrollEndDetector"} />,
                    <components.tools.LoadingStatus key={"LoadingStatus"} />
               ]
    }

    getStats()
    {
        return <AsyncStats
        />
    }


}
