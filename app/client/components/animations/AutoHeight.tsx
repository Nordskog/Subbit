import * as React from 'react';
import TimelineLite from 'gsap/umd/TimelineLite'; import 'gsap/umd/CSSPlugin';
import { Power1 } from 'gsap/umd/EasePack'; 
import { tools } from '~/common';


interface Props
{
    delay?: number;
    duration?: number;
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
    private timeline : TimelineLite;
    
    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay || 0, duration: props.duration || 0.4 };
    }

    public componentDidMount()
    {
        this.prevHeight = this.container.clientHeight;
    }

    public componentDidUpdate()
    {
        let height : number = this.container.clientHeight;

        if ( this.prevHeight !== height)
        {
            // Client size includes padding, but it is added to the height we set. Remove from animated value to compensate.
            let {verticalPadding, horizontalPadding} = tools.component.getPadding(this.container);
            height -= verticalPadding;

            this.prevHeight -= verticalPadding;

            if ( this.prevHeight != null)
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
                                height: this.prevHeight
                
                            }, 
                            {
                                 height: height,
                                 clearProps:  'height',
                                 ease: Power1.easeInOut
                            });
                
                            this.timeline.eventCallback( 'onComplete', () => { this.timeline = null; }) ;
                            this.timeline.play();
                    }
            }
        }
        
        this.prevHeight = height;
    }

    public render()
    {
        return  <div ref={(c) => this.container = c} style={ { overflow: 'hidden' } }>
                    {this.props.children}
                </div>;
    }
    
}
