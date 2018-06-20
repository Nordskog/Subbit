import * as React from 'react';

import * as styles from 'css/confirmationDropdown.scss'
import * as components from '~/client/components'
import * as transitions from 'react-transition-group'

interface Props
{
    message: string;
    positiveMessage: string;
    negativeMessage: string;
    onClick( ok : boolean): void;
}

interface State
{
    expanded : boolean;
}

export default class confirmationDropdown extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = { expanded: false };
    }

    public render()
    {
        return  <transitions.TransitionGroup component={'div'} className={styles.container}>
                    <div className={styles.dangerButton} onClick={() => this.handleClick()  }>
                        {this.props.message}
                    </div>
                    {this.getDropdown()}
                </transitions.TransitionGroup>
    }

    getDropdown()
    {
        if (this.state.expanded)
        {
        return    <components.transitions.FadeResize key={"dropdown"}>
                        <div className={styles.responseContainer}>
                            <div onClick={() => this.handleResponseClick(true)} className={styles.dangerSubButton}>{this.props.positiveMessage}</div>
                            <div onClick={() => this.handleResponseClick(false)} className={styles.safeSubButton}>{this.props.negativeMessage}</div>
                        </div>
                    </components.transitions.FadeResize>
        }
    }

    handleClick()
    {
        this.setState( { expanded: !this.state.expanded } );
    }

    handleResponseClick( ok : boolean)
    {
        if (!ok)
        {
            this.handleClick();
        }

        this.props.onClick(ok);
    }
}