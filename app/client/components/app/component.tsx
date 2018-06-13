import * as React from 'react';
import * as components from '~/client/components';

import * as Toastify from 'react-toastify'
import * as models from '~/common/models'


//import 'css/site'
//import 'react-toastify/dist/ReactToastify.css';

import * as styles from 'css/site.scss'

interface Props
{
    
}
   

export default class app extends React.Component<Props,any>
{
    render()
    {
      return <div>
                <Toastify.ToastContainer/>
                <components.header/>
                <div className={styles.contentOuterContainer}>
                    {this.renderMain()}
                </div>
                    
             </div>
    }

    renderMain()
    {
        return   <div className={styles.contentContainer}>
                    <components.authors />
                    <components.tools.scrollEndDetector />
                    <components.tools.LoadingStatus />
                </div>
    }

}
