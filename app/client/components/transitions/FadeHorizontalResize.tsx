import * as React from 'react';


import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import * as api from '~/common/api'

import * as siteStyles from 'css/site.scss'

import * as gsap from 'gsap'

import Transition from './Transition';


 export default class FadeHorizontalResize extends Transition
{
    come(container : HTMLDivElement, callback)
    {
        let width : number = container.clientWidth;
        let timeline = new gsap.TimelineMax();


        timeline.delay(this.state.delay);

        timeline.fromTo(container, this.state.duration, 
            { 
                opacity: 0,
                width: 0

            }, 
            {
                width: width,
                opacity: 1,
                clearProps: 'width, opacity'
            });

            timeline.eventCallback( 'onComplete', callback );
            timeline.play();
    }

    go(container : HTMLDivElement, callback)
    {
        let width : number = container.clientWidth;
        gsap.TweenMax.fromTo(container, this.state.duration, 
            {
                width: width,
                opacity: 1
            },
            {
                width: 0,
                opacity : 0,
                onComplete: callback,
                clearProps: 'width, opacity'
            });
    }  
}
