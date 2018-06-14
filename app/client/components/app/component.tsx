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

    shouldComponentUpdate(nextProps : Props)
    {
        //A user may be viewing their subscriptions, and unsubscribe from the last author.
        //With there being no subscriptions we would normally display the welcome message,
        //but we would rather give the user an opportunity to resubsctibe to the author instead.
        //Doing so will trigger a change the number of subs, so if that's what happened we can just ignore it.
        if (  this.props.subscriptionCount != nextProps.subscriptionCount )
        {
            return false;
        }

        return true;
    }

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
