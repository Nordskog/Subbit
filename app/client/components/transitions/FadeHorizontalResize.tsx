import TimelineLite from 'gsap/umd/TimelineLite'; 
import TweenLite from 'gsap/umd/TweenLite'; 
import 'gsap/umd/CSSPlugin';

import Transition from './Transition';
import { tools } from '~/common';


 export default class FadeHorizontalResize extends Transition
{
    come(container : HTMLDivElement, callback)
    {
        let width : number = container.clientWidth;
        let {verticalPadding, horizontalPadding} = tools.component.getPadding(container);
        width -= horizontalPadding;
        let timeline = new TimelineLite();


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
        let {verticalPadding, horizontalPadding} = tools.component.getPadding(container);
        width -= horizontalPadding;
        TweenLite.fromTo(container, this.state.duration, 
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
