import * as React from 'react';
import * as models from '~/common/models'
import { LoadingStatus } from '~/common/models';
import * as siteStyles from 'css/site.scss'
import { LoadingIcon } from '~/client/components/tools';

interface Props
{
  loadingCount : number;
  loadingProgress : number;
}

interface State
{
  
}

export default class LoadingProgress extends React.Component<Props,State> {

  getProgress() : number
  {

    if (this.props.loadingCount != null && this.props.loadingProgress != null)
    {
      //let progress =  Math.floor( (this.props.loadingProgress / this.props.loadingCount * 100) );
      let progress =  (this.props.loadingProgress / this.props.loadingCount );
      return progress;

    }

    return 0;
  }

  render() {
    return <div className={siteStyles.loadingProgressContainer}>
              <div className={siteStyles.loadingProgressBar} style={ { flex: this.getProgress() } } />
            </div>
  }
}