import * as React from 'react';

import TimelineLite from 'gsap/umd/TimelineLite'; 
import TweenLite from 'gsap/umd/TweenLite'; 
import 'gsap/umd/CSSPlugin';

import Transition from './Transition';


 export default class Fade extends Transition
{
    come(container : HTMLDivElement, callback)
    {
        let timeline = new TimelineLite();


        timeline.delay(this.state.delay);

        timeline.fromTo(container, this.state.duration, 
            { 
                opacity: 0

            }, 
            {
                opacity: 1,
                clearProps:  'opacity'
            });

            timeline.eventCallback( 'onComplete', callback );
            timeline.play();
    }

    go(container : HTMLDivElement, callback)
    {
           TweenLite.fromTo(container, this.state.duration, 
               {
                    opacity: 1
               },
               {
                    opacity : 0,
                   onComplete: callback,
                   clearProps: 'opacity'
               });
    }    
}
