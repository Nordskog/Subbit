import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import * as api from '~/common/api'

import * as siteStyles from 'css/site.scss'

import * as gsap from 'gsap'


import Transition from './Transition';


 export default class ScrollWrap extends Transition
{    
    come(container : HTMLDivElement, callback)
    {
        let height : number = container.clientHeight;
        let timeline = new gsap.TimelineMax();


        timeline.delay(this.state.delay);

        timeline.fromTo(container, this.state.duration, 
            { 
                opacity: 0,
                height: 0

            }, 
            {
                height: height,
                opacity: 1,
                clearProps: 'height, opacity'
            });

            timeline.eventCallback( 'onComplete', callback );
            timeline.play();
    }

    go(container : HTMLDivElement, callback)
    {
        
        let height : number = container.clientHeight;
        gsap.TweenMax.fromTo(container, this.state.duration, 
            {
                 height: height,
                 opacity: 1
            },
            {
                height: 0,
                 opacity : 0,
                onComplete: callback,
                clearProps: 'height, opacity'
            });
    }
}
