import * as React from 'react';
import * as siteStyles from 'css/site.scss'

import SVGInline from "react-svg-inline"
import * as checkmark from 'assets/images/checkmark.svg'

interface Props
{
    checked? : boolean
    callback?( checked : boolean ):  void;
}

interface State
{
    checked : boolean
}

export default class Checkbox extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = { checked: true };
    }

    static getDerivedStateFromProps( newProps : Props)
    {
        if (newProps.checked != null)
        {
            return { checked : newProps.checked };
        }
        else
        {
            return null;
        }
    }

    public render()
    {
        return  <div className={siteStyles.checkboxContainer}>
                    <SVGInline className={this.state.checked ? siteStyles.checkBoxChecked : siteStyles.checkBox} svg={checkmark}/>
                    <input type="checkbox" onChange={ () => this.handleClick() }/>
                </div>
    }

    public toggle()
    {
        this.handleClick();
    }

    public getChecked()
    {
        return this.state.checked;
    }

    handleClick()
    {
        if (this.props.callback != null)
        {
            this.props.callback( !this.state.checked );
        }
        this.setState( {  checked: !this.state.checked } );
    }
}