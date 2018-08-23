import * as React from 'react';
import * as models from '~/common/models';
import { LoadingStatus } from '~/common/models';
import * as siteStyles from 'css/site.scss';

interface Props
{
    getNextPage() : void; 
    status: LoadingStatus;
}

interface State
{
  status: LoadingStatus;
  prevProps: Props; // I ... guess this is a thing now
}

export default class ScrollEndDetectorComponent extends React.Component<Props,State> {

  constructor(props) {
    super(props);
    this.state = { ...props };

    this.handleScroll = this.handleScroll.bind(this);
  }

  public static getDerivedStateFromProps( nextProps : Props, prevState : State )
  {
      if (nextProps !== prevState.prevProps)
      {
          return { 
            ...nextProps,
            prevProps: nextProps
        };
      }
      return null;
  }


  public componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  public componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  
  public shouldComponentUpdate(nextProps : Props, nextState : State)
  {
    // We don't render anything so we don't really care.
    // If the page content does not extend far enough to make the scroll bar appear,
    // we will never trigger a scroll event. Here we check if the state changes from 
    // loading -> done, and do an additional check after a short delay.
    if (this.props.status === LoadingStatus.LOADING && nextProps.status === LoadingStatus.DONE)
    {
      setTimeout( () => 
      {
        this.handleScroll();
      }, 200);
    }


    return true;
  }

  private isNearBottomOfPage()
  {
    const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;


    // Turns out it will never euqal docHeight, always being off by 0.3 or so
    // Triggering load once we're within  half screen height to end seems reasonable
    let triggerDistance = (windowHeight);
    if ( (windowBottom) >= (docHeight - triggerDistance) )  
    {
        return true;
    }
}


  private canLoadMore()
  {
    return this.state.status === LoadingStatus.DONE;
  }

  private handleScroll() 
  {
    if ( !this.canLoadMore() )
      return;

    if ( this.isNearBottomOfPage() )
    {
      this.setState({
        ...this.state,
        status: LoadingStatus.LOADING
      });
      
      this.props.getNextPage();
    }
  }


  public render() {
    return <div/>;
  }
}
