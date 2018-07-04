import * as React from 'react';
import * as models from '~/common/models'
import * as components from '~/client/components'
import { ToggleItem } from '~/client/components/tools';
import * as urls from '~/common/urls'
import * as actions from '~/client/actions'

import { NavLink} from 'redux-first-router-link'

import * as styles from 'css/userSettings.scss'
import { PostDisplay } from '~/common/models';

interface Props
{
    postDisplay : models.PostDisplay;
    authenticated : boolean;
    statsAccess : boolean;
    changePostDisplay( mode: models.PostDisplay) : void;
    logoutOnAllDevices() : void;
    logout() : void;
    close?() : void;

}

interface State
{
    postDisplayItems : ToggleItem[];
    postDisplaySelected : ToggleItem;
}

export default class UserSettingsComponent extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = { postDisplayItems: [], postDisplaySelected: null};
    }

    static getDerivedStateFromProps( newProps : Props)
    {
        let selected : ToggleItem = null;
        let items : ToggleItem[] =  [
                                        {
                                            display: "Minimal",
                                            object: models.PostDisplay.MINIMAL
                                        },
                                        {
                                            display: "Compact",
                                            object: models.PostDisplay.COMPACT
                                        },
                                        {
                                            display: "Full",
                                            object: models.PostDisplay.FULL
                                        }
                                    ];

        // ...
        switch(newProps.postDisplay)
        {
            case PostDisplay.MINIMAL: 
                selected = items[0];
                break;
            case PostDisplay.COMPACT: 
                selected = items[1];
                break;
            case PostDisplay.FULL: 
                selected = items[2];
                break;
        }

        return { postDisplayItems: items, postDisplaySelected: selected };
    }

    public render()
    {
        return <div className={ styles.container }>
                    {this.getLoginButton()}
                    {this.getPostDisplayToggle()}
                    {this.getStatsButton()}
                    {this.getLogoutButton()}
                    {this.getlogoutOnAllDevicesButton()}
                </div>
    }

    getPostDisplayToggle()
    {
        return  <components.tools.OptionDropdown message={"Post display format"}> 
                         <components.tools.Toggle
                        items={this.state.postDisplayItems}
                        selected={this.state.postDisplaySelected}
                        onClick={ (item : ToggleItem ) => { this.props.changePostDisplay(item.object) } } />   
                </components.tools.OptionDropdown>
    }

    getLoginButton()
    {
        if (!this.props.authenticated)
        {
            return <a href={urls.RFY_AUTHORIZE_REMOTE} className={styles.genericButton}>Login</a>
        }
    }

    getStatsButton()
    {
        if (this.props.statsAccess)
        {
            return  <NavLink onClick={ () => this.props.close()} className={ styles.genericButton }
                        to={ { type: actions.types.Route.STATS, payload: { } } as actions.types.Route.STATS }>
                        Stats
                    </NavLink>
        }
    }

    getLogoutButton()
    {
        if (this.props.authenticated)
        {
            return <components.tools.ConfirmationDropdown
                        onClick={ ok => this.handleLogoutClick(ok) }
                        message={"Logout"}
                        positiveMessage={"Logout"}
                        negativeMessage={"Never mind"}
            />
        }
    }

    getlogoutOnAllDevicesButton()
    {
        if (this.props.authenticated)
        {
            return <components.tools.ConfirmationDropdown
                        onClick={ ok => this.handleLogoutAllClick(ok) }
                        message={"Logout on all devices"}
                        positiveMessage={"Logout"}
                        negativeMessage={"Never mind"}
            />
        }
    }

    handleLogoutClick( ok : boolean )
    {
        if (ok)
        {
            if (this.props.close != null)
                this.props.close();
            this.props.logout();
        }
    }

    handleLogoutAllClick( ok : boolean )
    {
        if (ok)
        {
            if (this.props.close != null)
                this.props.close();
            this.props.logoutOnAllDevices();
        }
    }

};
