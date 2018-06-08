import * as React from 'react';
import * as models from '~/common/models'

import * as styles from 'css/toggle.scss'

export interface ToggleItem
{
    display: string;
    object?: any;
}

interface Props
{
    selected : ToggleItem;
    items : ToggleItem[];
    onClick( item : ToggleItem ) : void;
}

interface State
{
    selected : ToggleItem;
}

export default class ToggleComponent extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = { selected: null };
    }


    static getDerivedStateFromProps( newProps : Props)
    {
        return { selected : newProps.selected }
    }

    public render()
    {
        return  <div className={styles.container}>
                    {this.getItems()}
                </div>
    }

    getItems()
    {
        let elements = [];
        this.props.items.forEach( ( item : ToggleItem, index : number) => 
        {
            elements.push( this.getItem( item, index.toString()) );   
        });

        return elements;
    }

    getItem( item : ToggleItem, key : string )
    {
        return <div key={key} onClick={ () => this.handleClick(item)  } className={ this.isSelected(item) ? styles.itemSelected : styles.item} >
                    {item.display}
               </div>
    }

    isSelected( item : ToggleItem)
    {
        return item == this.state.selected;
    }

    handleClick( item : ToggleItem)
    {
        if ( this.isSelected(item) )
            return;
        this.props.onClick(item);
    }
}