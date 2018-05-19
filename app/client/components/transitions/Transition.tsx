import * as React from 'react';
import { Link } from 'react-router-dom';

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
    appear?: boolean;
}

interface State
{
    delay: number;
    duration: number;
    appear: boolean;
}

/**
 * A transition component that must be extended.
 * Extending class must implement come(container, callback) and go(container, callback)
 */
 export default class Transition extends React.Component<Props, State>
{
    container : HTMLDivElement;
    
    constructor( props : Props)
    {
        super(props);
        this.state = { delay: props.delay || 0, duration: props.duration || 0.3, appear: this.props.appear || false };

    }

    come(container : HTMLDivElement, callback)
    {

    }

    go(container : HTMLDivElement, callback)
    {

    }


    componentWillAppear(callback)
    {
        if (this.state.appear)
            this.come(this.container,callback);
        else
            callback();
    }
    
    componentDidAppear()
    {


    }
    

    componentWillEnter( callback )
    {
        this.come(this.container, callback);
    }

    componentWillLeave( callback)
    {
        this.go(this.container, callback);
    }
    
    componentDidLeave()
    {
    }
    
    componentDidEnter( )
    {
        
    }

    render()
    {
        return  <div ref={c => this.container = c} style={ { overflow: 'hidden' } }>
                    {this.props.children}
                </div>
    }
    
}
