import TimelineLite from 'gsap/TimelineLite'; 
import TweenLite from 'gsap/TweenLite'; 
import 'gsap/CSSPlugin';


import Transition from './Transition';
import { tools } from '~/common';


 export default class FadeVerticalResize extends Transition
{    
    come(container : HTMLDivElement, callback)
    {
        let height : number = container.clientHeight;
        let width : number = container.clientWidth;

        let {verticalPadding, horizontalPadding} = tools.component.getPadding(container);
        width -= horizontalPadding;
        height -= verticalPadding;

        let timeline = new TimelineLite();


        timeline.delay(this.state.delay);

        timeline.fromTo(container, this.state.duration, 
            { 
                opacity: 0,
                height: 0,
                width: 0

            }, 
            {
                width: width,
                height: height,
                opacity: 1,
                clearProps: 'height, width, opacity'
            });

            timeline.eventCallback( 'onComplete', callback );
            timeline.play();
    }

    go(container : HTMLDivElement, callback)
    {
        
        let height : number = container.clientHeight;
        let width : number = container.clientWidth;
        let {verticalPadding, horizontalPadding} = tools.component.getPadding(container);
        width -= horizontalPadding;
        height -= verticalPadding;

        TweenLite.fromTo(container, this.state.duration, 
            {
                width: width,
                height: height,
                opacity: 1
            },
            {
                width: 0,
                height: 0,
                opacity : 0,
                onComplete: callback,
                clearProps: 'height, opacity'
            });
    }
}
