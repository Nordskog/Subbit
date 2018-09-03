import * as React from 'react';

import * as siteStyles from 'css/site.scss';

import * as animationStyles from 'css/animations.scss';

import { classConcat } from '~/common/tools/css';


interface Props
{
  durationSeconds : number;
  loading : boolean;
}


export default class TimeProgress extends React.Component<Props,null> {

  private getClazz()
  {
    if (this.props.loading)
    {
      return classConcat(siteStyles.timeProgressBar, siteStyles.timeProgressBarFull);
    }
    else 
    {
      return siteStyles.timeProgressBar;
    }
  }

  private getStyle()
  {
    if (this.props.loading)
    {
      return {
        transition: `width ${this.props.durationSeconds}s linear`,
      };
    }
    else 
    {
      return {};
    }
  }

  public render() {
    return <div className={siteStyles.loadingProgressContainer}>
              <div className={this.getClazz()} style={this.getStyle()} />
            </div>;
  }
}
