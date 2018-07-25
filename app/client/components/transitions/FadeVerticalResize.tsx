import TimelineLite from 'gsap/TimelineLite'; 
import TweenLite from 'gsap/TweenLite'; 
import 'gsap/CSSPlugin';


import Transition from './Transition';


 export default class FadeVerticalResize extends Transition
{    
    come(container : HTMLDivElement, callback)
    {
        let height : number = container.clientHeight;
        let timeline = new TimelineLite();


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
        TweenLite.fromTo(container, this.state.duration, 
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
