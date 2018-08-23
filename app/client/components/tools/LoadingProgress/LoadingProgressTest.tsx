import * as React from 'react';
import * as siteStyles from 'css/site.scss';

import LoadingProgress from './LoadingProgress';


interface State
{
  progress : number;
}

export default class LoadingProgressTest extends React.Component<null,State> {

  public state = { progress : 0 };
  private interval = null;


  public componentWillMount()
  {
    if (this.interval == null)
    {
      this.interval = setInterval( () => 
      { 
        let newVal = this.state.progress + 1;
        if (newVal >= 20)
         newVal = 0;
        this.setState( { progress: newVal} ); 

      
      }, 200);
    }  
  }

  public componentWillUnmount()
  {
    if (this.interval != null)
      clearInterval(this.interval);
    this.interval = null;
  }

  public render() {
    return <LoadingProgress loadingCount={20} loadingProgress={this.state.progress} />;
  }
}
