import * as React from 'react';
import * as models from '~/common/models'
import { LoadingStatus } from '~/common/models';
import * as siteStyles from 'css/site.scss'

interface Props extends models.state.PageState
{
    getNextPage() : void; 
}

interface State extends models.state.PageState
{
  prevProps: Props; //I ... guess this is a thing now
}

export default class ScrollEndDetectorComponent extends React.Component<Props,State> {

  constructor(props) {
    super(props);
    this.state = { ...props };

    this.handleScroll = this.handleScroll.bind(this);
  }

  static getDerivedStateFromProps( nextProps : Props, prevState : State )
  {
      if (nextProps != prevState.prevProps)
      {
          return { 
            ...nextProps,
            prevProps: nextProps
        };
      }
      return null;
  }


  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  canLoadMore()
  {
    return this.state.status == LoadingStatus.DONE;
  }

  handleScroll() 
  {
    if ( !this.canLoadMore() )
      return;
    const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;


    //Turns out it will never euqal docHeight, always being off by 0.3 or so
    //Triggering load once we're within  half screen height to end seems reasonable
    let triggerDistance = (windowHeight);
    if ( (windowBottom) >= (docHeight - triggerDistance) )  
    {
      this.setState({
        ...this.state,
        status: LoadingStatus.LOADING
      });
      
      this.props.getNextPage();
    }
  }


  render() {
    return this.getDiv();
  }

  getMessage()
  {
    switch(this.state.status)
    {
        case LoadingStatus.DONE:
          return "Loading...";  //As soon as the user sees it it should be loading anyway
        case LoadingStatus.LOADING:
          return "Loading..."; 
        case LoadingStatus.END:
          return "No more authors"; 
        case LoadingStatus.ERROR:
          return "Something went wrong"; 
        case LoadingStatus.EMPTY:
          return "There's nothing here"; 
    }
  }

  getDiv()
  {
      return <div className={siteStyles.loadingStatus}>{this.getMessage()}<br/>{this.getProgress()}</div>
  }

  getProgress()
  {
    if (this.props.loadingCount != null && this.props.loadingProgress != null)
    {
      return this.props.loadingProgress + " / " + this.props.loadingCount;
    }
  }
}