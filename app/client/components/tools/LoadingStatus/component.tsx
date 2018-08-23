import * as React from 'react';
import * as models from '~/common/models';
import { LoadingStatus } from '~/common/models';
import * as siteStyles from 'css/site.scss';
import { LoadingIcon, LoadingProgress } from '~/client/components/tools';

interface Props extends models.state.SiteState
{
  
}

export default class LoadingStatusComponent extends React.Component<Props,null> 
{

  public render() 
  {
    return  <div className={siteStyles.loadingStatus}>
              < LoadingIcon status={this.props.status} />
              {this.getMessage()}<br/>
              <LoadingProgress 
              loadingCount={this.props.loadingCount}
              loadingProgress={this.props.loadingProgress}
              />
            </div>;
  }

  private getMessage()
  {
    switch( this.props.status)
    {
        case LoadingStatus.DONE:
          return null;
        case LoadingStatus.LOADING:
          return null;
        case LoadingStatus.END:
          return "No more authors"; 
        case LoadingStatus.ERROR:
          return "Something went wrong"; 
        case LoadingStatus.EMPTY:
          return "There's nothing here"; 
    }
  }
}
