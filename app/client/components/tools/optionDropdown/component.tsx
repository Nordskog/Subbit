import * as React from 'react';

import * as styles from 'css/optionDropdown.scss';
import * as components from '~/client/components';
import * as transitions from 'react-transition-group';

interface Props
{
    message: string;
}

interface State
{
    expanded : boolean;
}

export default class OptionsDropdown extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = { expanded: false };
    }

    public render()
    {
        return  <transitions.TransitionGroup component={'div'} className={styles.container}>
                    <div className={styles.genericButton} onClick={() => this.handleClick()  }>
                        {this.props.message}
                    </div>
                    {this.getDropdown()}
                </transitions.TransitionGroup>;
    }

    private getDropdown()
    {
        if (this.state.expanded)
        {
        return   <components.transitions.FadeVerticalResize className={styles.dropdownContainer}  key={"dropdown"}>
                    {this.props.children}
                    </components.transitions.FadeVerticalResize>;
        }
    }

    private handleClick()
    {
        this.setState( { expanded: !this.state.expanded } );
    }
}
