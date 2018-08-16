import * as React from 'react';

import * as styles from 'css/popup.scss'
import * as animationStyles from 'css/animations.scss';
import * as ReactDOM from 'react-dom'
import { tools } from '~/common';

export enum Position 
{
    TOP, BOTTOM, LEFT, RIGHT, CENTER
}

export enum Alignment
{
    BEGINNING, CENTER, END
}

interface Props
{
    trigger : JSX.Element;
    children : ( close : () => void ) => JSX.Element;
    modal? : boolean;
    fullscreen? : boolean;
    position? : Position;
    alignment? : Alignment;
    overlayClass? : string;
    contentClass? : string;
    showBackground? : boolean;
    hover? : boolean;
    hoverAppearDelay? : number;
    hoverDisappearDelay? : number;
    fadeIn? : number;
}

interface State
{
    open : boolean;
}

export default class Popup extends React.Component<Props, State>
{
    state = { open: false };
    triggerRef : HTMLElement;

    static defaultProps = {
        modal: false,
        fullscreen: false,
        hover: false,
        showBackground: false,
        hoverAppearDelay: 0,
        hoverDisappearDelay: 0,
        fadeIn : 0.25


    }

    setTriggerRef( ref : any)
    {
        //Sometimes gets called twice with an initially null value
        if (ref == null)
            return;

        //Ref may be to a dom element, or a component
        //TODO better test
        if (ref.getBoundingClientRect == null)
        {
            this.triggerRef =  ReactDOM.findDOMNode(ref) as any;
           
        }
        else
        {
            this.triggerRef = ref;
        }
    }

    mouseHoverTimeout = null;

    candleMouseHoverTimeout()
    {
        if (this.mouseHoverTimeout != null)
        {
            clearTimeout(this.mouseHoverTimeout);
        }

        this.mouseHoverTimeout = null;
    }

    handleMouseEnter()
    {
        this.candleMouseHoverTimeout();
        if (!this.state.open)
        {
            this.mouseHoverTimeout = setTimeout(() => {
                this.setState( { open: true } );
            }, this.props.hoverAppearDelay * 1000);
        }
    }

    handleMouseLeave()
    {
        this.candleMouseHoverTimeout();
        if (this.state.open)
        {
            this.mouseHoverTimeout = setTimeout(() => {
                this.setState( { open: false } );
            }, this.props.hoverDisappearDelay * 1000);
        }
    }

    getTrigger( clickClose : boolean)
    {
        if (this.props.hover)
        {
            if (clickClose)
            {
                return React.cloneElement( this.props.trigger, {  onMouseEnter: () => this.handleMouseEnter(), onMouseLeave: () => this.handleMouseLeave(), ref: ( ref : HTMLElement ) => this.setTriggerRef(ref) } );
            }
            else
            {
                return React.cloneElement( this.props.trigger, {  key: "trigger", onMouseLeave: () => this.handleMouseLeave(), ref: ( ref : HTMLElement ) => this.setTriggerRef(ref) } );
            }
        }
        else
        {
            if (clickClose)
            {
                return React.cloneElement( this.props.trigger, {  onClick: () => this.setState( { open: true } ), ref: ( ref : HTMLElement ) => this.setTriggerRef(ref) } );
            }
            else
            {
                return React.cloneElement( this.props.trigger, {  key: "trigger", ref: ( ref : HTMLElement ) => this.setTriggerRef(ref) } );
            }
        }



    }

    getAlignmentPositionOffset( triggerHeight : number) : number
    {
        switch(this.props.alignment)
        {
            case Alignment.BEGINNING:
                return 0;

            case Alignment.CENTER:  //styles.centerTop //styles.centerLeft
                return triggerHeight * 0.5;

            case Alignment.END:     //styles.top    //styles.left
                return triggerHeight;
            
        }

        return 0;
    }

    getPosition()
    {
        if (this.props.position != null && !this.props.modal )
        {
            let boundingBox = this.triggerRef.getBoundingClientRect();
        
            let triggerTop : number = boundingBox.top + (window.scrollY || document.documentElement.scrollTop || 0);
            let triggerLeft : number = boundingBox.left + (window.scrollX || document.documentElement.scrollLeft || 0 );

            //Compensate for relative parent that is not root
            let offsetTop : number = this.triggerRef.offsetTop;
            let offsetLeft : number = this.triggerRef.offsetLeft;
            triggerTop =  (offsetTop - triggerTop) + triggerTop;
            triggerLeft =  (offsetLeft - triggerLeft) + triggerLeft;

            let posTop = triggerTop;
            let posLeft = triggerLeft;
            
            if ( this.props.fullscreen)
            {
                switch(this.props.position)
                {
                    case Position.BOTTOM:
                    {
                        posTop += boundingBox.height;
                        break;
                    }
                    
                    case Position.CENTER:
                    {
                        posTop += boundingBox.height * 0.5;
                    }
        
                    default:
                    {
                        
                    }
                }

                return {
                    top: posTop,
                    left: 0
                }
            }
            else
            {
                switch(this.props.position)
                {
                    case Position.TOP:
                    {
                        posLeft += this.getAlignmentPositionOffset(boundingBox.width);
                        break;
                    }
                    case Position.BOTTOM:
                    {
                        posLeft += this.getAlignmentPositionOffset(boundingBox.width);
                        posTop += boundingBox.height;
                        break;
                    }
                    
                    case Position.LEFT:
                    {
                        posTop += this.getAlignmentPositionOffset(boundingBox.height);
                        break;
                    }
                    case Position.RIGHT:
                    {
                        posTop += this.getAlignmentPositionOffset(boundingBox.height);
                        posLeft += boundingBox.width;
                        break;
                    }
    
                    case Position.CENTER:
                    {
                        posLeft += boundingBox.width * 0.5;
                        posTop += boundingBox.height * 0.5;
                    }
        
                    default:
                    {
                        
                    }
                }

                return {
                    top: posTop,
                    left: posLeft,
                }
            }
        }
        else
        {
            return {};
        }
    
    }

    getChildren()
    {
        return this.props.children( () => { this.setState( { open: false } ) } );
    }

    getPositionStyle()
    {
        let alignment = this.props.alignment;
        if (this.props.fullscreen && this.props.position != Position.CENTER)
            alignment = null;

        switch(this.props.position)
        {
            case Position.TOP:
                switch(alignment)
                {
                    case Alignment.CENTER:
                        return styles.topCenter;
                    case Alignment.END:
                        return styles.topEnd;
                    default:
                        return styles.top;
                }
            case Position.BOTTOM:
                switch(alignment)
                {
                    case Alignment.CENTER:
                        return styles.bottomCenter;
                    case Alignment.END:
                        return styles.bottomEnd;
                    default:
                        return styles.bottom;
                }
            case Position.LEFT:
                switch(alignment)
                {
                    case Alignment.CENTER:
                        return styles.leftCenter;
                    case Alignment.END:
                        return styles.leftEnd;
                    default:
                        return styles.left;
                }
            case Position.RIGHT:
                switch(alignment)
                {
                    case Alignment.CENTER:
                        return styles.rightCenter;
                    case Alignment.END:
                        return styles.rightEnd;
                    default:
                        return styles.right;
                }
            case Position.CENTER:
            {
                if (this.props.fullscreen)
                {
                    return styles.fullscreenCenter;
                }
                else
                {
                    return styles.center;
                }
   
            } 

            default:
                return null;
        }
    }

    getFullscreenStyle()
    {
        if (this.props.fullscreen)
        {
            return styles.fullscreen;
        }
    }

    getStyle()
    {
        if ( !this.props.modal)
        {
            return [this.getPositionStyle(), this.getFullscreenStyle()];
        }
        else
        {
            return [this.getFullscreenStyle()];
        }
    }

    getFadeInStyle()
    {
        let animationStyle = {};

        if (this.props.fadeIn > 0)
        {
            animationStyle = { animation: `${animationStyles.fadeIn} ${ this.props.fadeIn }s`  }
        }

        return animationStyle;
    }

    render()
    {
        if (this.state.open)
        {
            if (this.props.modal)
            {
                return [
                    <div className={ styles.holder }      key={"holder"}/>,
                    <div className={ tools.css.classConcat( this.props.showBackground ?  styles.hiddenModalOverlay :styles.modalOverlay, this.props.overlayClass ) } style={ this.getFadeInStyle() }    key={"overlay"} onClick={ () => this.setState( { open: false } ) }>
                        <div className={ tools.css.classConcat(styles.content, ...this.getStyle(), this.props.contentClass) } key={"content"} style={ { ...this.getFadeInStyle(), ...this.getPosition()} }>
                            {this.getChildren()}
                        </div>
                    </div>,
                    this.getTrigger(false)
                ]
            }
            else
            {
                return [
                    <div className={styles.holder}  key={"holder"}/>,
                    this.props.showBackground? null : <div className={ tools.css.classConcat( styles.overlay, this.props.overlayClass ) }  key={"overlay"} style={ this.getFadeInStyle() } onClick={ () => this.setState( { open: false } ) } />,
                    <div className={ tools.css.classConcat(styles.content, ...this.getStyle(), this.props.contentClass)} key={"content"} style={  { ...this.getFadeInStyle(), ...this.getPosition()}  }>
                        {this.getChildren()}
                    </div>,
                    this.getTrigger(false)
                ]
            }
        }
        else
        {
            return this.getTrigger(true);
        }
    }

}

