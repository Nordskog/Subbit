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
    private container : HTMLDivElement;
    
    public static defaultProps = {
        style : {  overflow: 'hidden' },
        delay: 0,
        appear: false,
        duration: 0.3

    };

    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay, duration: props.duration, appear: this.props.appear };

    }

    public come(container : HTMLDivElement, callback)
    {

    }

    public go(container : HTMLDivElement, callback)
    {

    }


    public componentWillAppear(callback)
    {
        if (this.state.appear)
            this.come(this.container,callback);
        else
            callback();
    }
    
    public componentDidAppear()
    {


    }
    

    public componentWillEnter( callback )
    {
        this.come(this.container, callback);
    }

    public componentWillLeave( callback)
    {
        this.go(this.container, callback);
    }
    
    public componentDidLeave()
    {
    }
    
    public componentDidEnter( )
    {
        
    }

    public render()
    {
        return  <div ref={(c) => this.container = c} onClick={this.props.onClick} className={this.props.className} style={ this.props.style }>
                    {this.props.children}
                </div>;
    }
    
}
