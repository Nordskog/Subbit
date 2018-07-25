import * as React from 'react';

interface Props
{
    delay?: number;
    duration?: number;
    appear?: boolean;
    className? : string;
    style? : {};
    onClick? : any;
}

interface State
{
    delay: number;
    duration: number;
    appear: boolean;
}

/**
 * A transition component that must be extended.
 * Extending class must implement come(container, callback) and go(container, callback)
 */
 export default class Transition extends React.Component<Props, State>
{
    container : HTMLDivElement;
    
    static defaultProps = {
        style : {  overflow: 'hidden' },
        delay: 0,
        appear: false,
        duration: 0.3

    }

    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay, duration: props.duration, appear: this.props.appear };

    }

    come(container : HTMLDivElement, callback)
    {

    }

    go(container : HTMLDivElement, callback)
    {

    }


    componentWillAppear(callback)
    {
        if (this.state.appear)
            this.come(this.container,callback);
        else
            callback();
    }
    
    componentDidAppear()
    {


    }
    

    componentWillEnter( callback )
    {
        this.come(this.container, callback);
    }

    componentWillLeave( callback)
    {
        this.go(this.container, callback);
    }
    
    componentDidLeave()
    {
    }
    
    componentDidEnter( )
    {
        
    }

    render()
    {
        return  <div ref={c => this.container = c} onClick={this.props.onClick} className={this.props.className} style={ this.props.style }>
                    {this.props.children}
                </div>
    }
    
}
