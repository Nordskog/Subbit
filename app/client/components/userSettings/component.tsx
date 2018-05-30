import * as React from 'react';
import * as models from '~/common/models'
import * as components from '~/client/components'
import { ToggleItem } from '~/client/components/tools';

import * as styles from 'css/userSettings.scss'

interface Props
{
    postDisplay : models.PostDisplay;
    changePostDisplay( mode: models.PostDisplay) : void;

}

interface State
{
    postDisplayItems : ToggleItem[];
    postDisplaySelected : ToggleItem;
}

export default class UserSettingsComponent extends React.Component<Props, State>
{
    state = { postDisplayItems: [], postDisplaySelected: null};

    static getDerivedStateFromProps( newProps : Props)
    {
        let selected : ToggleItem = null;
        let items : ToggleItem[] =  [
                                        {
                                            display: "Compact",
                                            object: models.PostDisplay.COMPACT
                                        },
                                        {
                                            display: "Normal",
                                            object: models.PostDisplay.NORMAL
                                        }
                                    ];

        // ...
        selected = newProps.postDisplay == models.PostDisplay.COMPACT ? items[0] : items[1];

        return { postDisplayItems: items, postDisplaySelected: selected };
    }

    public render()
    {
        return <div className={ styles.container }>
                    {this.getPostDisplayToggle()}
                </div>
    }

    getPostDisplayToggle()
    {
        return <div className={styles.row}>
                    <div className={styles.description}>Post format</div>
                    <components.tools.Toggle
                        items={this.state.postDisplayItems}
                        selected={this.state.postDisplaySelected}
                        onClick={ (item : ToggleItem ) => { this.props.changePostDisplay(item.object) } }
                    />          
                </div>
    }

};
