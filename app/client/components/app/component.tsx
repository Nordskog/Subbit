import * as React from 'react';
import * as components from '~/client/components';

import * as Toastify from 'react-toastify'
import * as models from '~/common/models'


//import 'css/site'
//import 'react-toastify/dist/ReactToastify.css';

import * as styles from 'css/site.scss'
import { MessageType } from '~/client/components/tools';

interface Props
{
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
                <components.header/>
                <div className={styles.contentOuterContainer}>
                    <div className={styles.contentContainer}>
                        {this.getContent()}
                    </div>
                </div>
                    
             </div>
    }

    getContent()
    {
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

}
