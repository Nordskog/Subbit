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

 export default class AutoWidth extends React.Component<Props, State>
{
    private container : HTMLDivElement;
    private prevWidth : number;
    private timeline : TimelineLite;
    
    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay || 0, duration: props.duration || 0.3 };
    }

    public componentDidMount()
    {
        this.prevWidth = this.container.clientWidth;
    }

    public componentDidUpdate()
    {
        let width : number = this.container.clientWidth;

        if ( this.prevWidth !== width)
        {
            // Client size includes padding, but it is added to the height we set. Remove from animated value to compensate.
            let {verticalPadding, horizontalPadding} = tools.component.getPadding(this.container);
            width -= horizontalPadding;

            this.prevWidth -= horizontalPadding;

            if ( this.prevWidth != null)
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
                                width: this.prevWidth
                
                            }, 
                            {
                                 width: width,
                                 clearProps:  'width',
                                 ease: Power1.easeInOut
                            });
                
                            this.timeline.eventCallback( 'onComplete', () => { this.timeline = null; }) ;
                            this.timeline.play();
                    }
            }
        }
        
        this.prevWidth = width;
    }

    public render()
    {
        return  <div ref={(c) => this.container = c} style={ { overflow: 'hidden' } }>
                    {this.props.children}
                </div>;
    }
    
}
