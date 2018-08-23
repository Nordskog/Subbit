import * as React from 'react';
import TimelineLite from 'gsap/umd/TimelineLite'; import 'gsap/umd/CSSPlugin';
import { tools } from '~/common';

interface Props
{
    delay?: number;
    duration?: number;
    className?: string;
}

interface State
{
    delay: number;
    duration: number;
}

 export default class AutoHeight extends React.Component<Props, State>
{
    private container : HTMLDivElement;
    private prevHeight : number;
    private prevWidth : number;
    private timeline : TimelineLite;
    
    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay || 0, duration: props.duration || 0.3 };
    }

    public componentDidMount()
    {
        // These will always be 0 really.
        this.prevHeight = this.container.clientHeight;
        this.prevWidth = this.container.clientWidth;
    }

    public componentDidUpdate()
    {
        let height : number = this.container.clientHeight;
        let width : number = this.container.clientWidth;
 
        if ( this.prevHeight !== height || this.prevWidth !== width)
        {
            // Client size includes padding, but it is added to the height we set. Remove from animated value to compensate.
            let {verticalPadding, horizontalPadding} = tools.component.getPadding(this.container);
            height -= verticalPadding;
            width -= horizontalPadding;
        
            if ( this.prevHeight != null && this.prevWidth != null)
            {
                    if (this.timeline != null)
                    {
                        // Wait for it to finish I guess.
                        // Maybe dynamically update target?
                        // Since it's changing we don't really know what it should be though.
                    }
                    else
                    {
                        this.timeline = new TimelineLite();
                        this.timeline.fromTo(this.container, this.state.duration, 
                            { 
                                height: this.prevHeight,
                                width: this.prevWidth
            
                            }, 
                            {
                                 height: height,
                                 width: width,
                                 clearProps:  'height, width'
                            });
                
                            this.timeline.eventCallback( 'onComplete', () => { this.timeline = null; }) ;
                            this.timeline.play();
                    }
            }
        }
        
        this.prevHeight = height;
        this.prevWidth = width;
    }

    public render()
    {
        return  <div ref={(c) => this.container = c} className={this.props.className} style={ { overflow: 'hidden' } }>
                    {this.props.children}
                </div>;
    }
    
}
