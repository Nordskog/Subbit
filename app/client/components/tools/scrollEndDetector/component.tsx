import * as React from 'react';
import * as models from '~/common/models'

interface Props extends models.state.ScrollState
{
  getNextPage(page: number ) : void; 
}

interface State extends models.state.ScrollState
{

}

export default class ScrollEndDetectorComponent extends React.Component<Props,State> {

  constructor(props) {
    super(props);
    this.state = { ...props };

    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    this.setState(
    { 
      ...nextProps,
    });
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }


  handleScroll() 
  {
    if (this.state.endReached || this.state.nextPageLoading)
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
      this.props.getNextPage(this.state.currentPage + 1);
      this.setState({
        ...this.state,
        nextPageLoading: true
      });
    
    }
    
  }


  render() {
    return this.getDiv();
  }

  getDiv()
  {
    if (this.state.endReached)
      return <div className="site-loadingStatus">No more posts</div>
    else if (this.state.nextPageLoading)
    {
      return <div className="site-loadingStatus">Loading...</div>
    }
    else
    {
      return <div className="site-loadingStatus">There's nothing here...</div>
    }
  }
}