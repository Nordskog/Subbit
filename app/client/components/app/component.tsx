import * as React from 'react';
import * as components from '~/client/components';

import { BrowserRouter, Router, Route, Switch } from 'react-router-dom';
import * as Toastify from 'react-toastify'
import * as models from '~/common/models'

//import 'bootstrap/dist/css/bootstrap.css';
import 'css/site'
import 'react-toastify/dist/ReactToastify.css';

interface Props
{
    mode : models.state.SiteMode
}

export default class app extends React.Component<Props,any>
{
    render()
    {
      return <div className="rootContainer">
                <Toastify.ToastContainer/>
                <components.header/>
                <div className="site-contentOuterContainer">
                    {this.renderMain()}
                </div>
                <components.tools.onPageLoad/>
                    
             </div>
    }

    renderMain()
    {
        switch(this.props.mode)
        {
            case models.state.SiteMode.AUTHORS:
            {
               return   <div className="site-contentContainer">
                            <components.authors />
                            <components.tools.scrollEndDetector />
                        </div>
            }
            case models.state.SiteMode.MANAGER:
            {
               return   <div className="site-contentContainer">
                           <components.manager/>
                        </div>
            }
        }
    }

}
