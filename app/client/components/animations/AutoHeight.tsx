import * as React from 'react';

import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import * as api from '~/common/api'

import * as siteStyles from 'css/site.scss'

import * as gsap from 'gsap'


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
    container : HTMLDivElement;
    prevHeight : number;
    timeline : gsap.TimelineMax;
    
    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay || 0, duration: props.duration || 0.3 };
    }

    componentDidMount()
    {
        this.prevHeight = this.container.clientHeight;
    }

    componentDidUpdate()
    {
        let height : number = this.container.clientHeight;

        if ( this.prevHeight != height)
        {
        
            if ( this.prevHeight != null)
            {
                    if (this.timeline != null)
                    {
                        //Wait for it to finish I guess.
                        //Maybe dynamically update target?
                        //Since it's changing we don't really know what it should be though.
                    }
                    else
                    {
                        this.timeline = new gsap.TimelineMax();
                        this.timeline.fromTo(this.container, this.state.duration, 
                            { 
                                height: this.prevHeight
                
                            }, 
                            {
                                 height: height,
                                 clearProps:  'height'
                            });
                
                            this.timeline.eventCallback( 'onComplete', () => { this.timeline = null }) ;
                            this.timeline.play();
                    }
            }
        }
        
        this.prevHeight = height;
    }

    render()
    {
        return  <div ref={c => this.container = c} style={ { overflow: 'hidden' } }>
                    {this.props.children}
                </div>
    }
    
}
