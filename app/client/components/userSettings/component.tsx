import * as React from 'react';
import * as models from '~/common/models';
import * as components from '~/client/components';
import { ToggleItem } from '~/client/components/tools';
import * as urls from '~/common/urls';
import * as actions from '~/client/actions';
import MediaQuery from 'react-responsive';

import { NavLink } from 'redux-first-router-link';

import * as styles from 'css/userSettings.scss';
import { PostDisplay } from '~/common/models';

import { classConcat } from '~/common/tools/css';
import config from 'root/config';
import { LoginType } from '~/common/models/auth';
import * as siteStyles from 'css/site.scss';

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
    rememberMe : boolean;
}

export default class UserSettingsComponent extends React.Component<Props, State>
{
    constructor( props : Props)
    {
        super(props);
        this.state = { rememberMe: true, postDisplayItems: [], postDisplaySelected: null};
    }

    public static getDerivedStateFromProps( newProps : Props)
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
                    {this.getAboutButton()}
                    {this.getImportButton()}
                    {this.getLogoutButton()}
                    {this.getlogoutOnAllDevicesButton()}
                </div>;
    }

    private getImportButton() 
    {
        if (this.props.authenticated)
        {
            return  <NavLink className={ styles.genericButton } 
                        onClick={ () => this.props.close() }
                        to={ { type: actions.types.Route.IMPORT, payload: { } } as actions.types.Route.IMPORT }>
                        Import
                    </NavLink>; 
        }
    }

    private getPostDisplayToggle()
    {
        return  <components.tools.OptionDropdown message={"Display"}> 
                         <components.tools.Toggle
                        items={this.state.postDisplayItems}
                        selected={this.state.postDisplaySelected}
                        onClick={ (item : ToggleItem ) => { this.props.changePostDisplay(item.object); } } />   
                </components.tools.OptionDropdown>;
    }

    private getLoginButton()
    {
        if (!this.props.authenticated)
        {
            return <MediaQuery query="screen and (max-width: 1100px)">
                    {
                        (matches : boolean) => 
                        {
                            return <div className={ config.common.loginEnabled ? styles.loginContainer : styles.loginContainerDisabled}>
                                        <a href={ config.common.loginEnabled ? urls.getClientLoginUrl(this.state.rememberMe ? LoginType.PERMANENT : LoginType.SESSION, matches) : "#"} 
                                        className={ styles.loginButton }>Login</a>
                                            <div className={styles.rememberMeCenterer} onClick={ () => this.setRememberMe( !this.state.rememberMe ) } >
                                            <div className={styles.rememberMeContainer} >
                                                <components.tools.Checkbox checked={this.state.rememberMe} callback={ (checked) => this.setRememberMe(checked) } />
                                                <span className={styles.rememberMeText}> Remember me</span> 
                                            </div>
                                        </div>
                
                                    </div>;
                        } 
                    }
                    </MediaQuery>;
        }
    }

    private setRememberMe( rememberMe : boolean)
    {
        this.setState( { rememberMe: rememberMe } );
    }

    private getStatsButton()
    {
        if (this.props.statsAccess)
        {
            return  <NavLink onClick={ () => this.props.close()} className={ styles.genericButton }
                        to={ { type: actions.types.Route.STATS, payload: { } } as actions.types.Route.STATS }>
                        Stats
                    </NavLink>;
        }
    }

    private getAboutButton()
    {
        return  <NavLink onClick={ () => this.props.close()} className={ styles.genericButton }
                    to={ { type: actions.types.Route.ABOUT, payload: { } } as actions.types.Route.ABOUT }>
                    About
                </NavLink>;  
    }

    private getLogoutButton()
    {
        if (this.props.authenticated)
        {
            return <components.tools.ConfirmationDropdown
                        onClick={ (ok) => this.handleLogoutClick(ok) }
                        message={"Logout"}
                        positiveMessage={"Logout"}
                        negativeMessage={"Never mind"}
            />;
        }
    }

    private getlogoutOnAllDevicesButton()
    {
        if (this.props.authenticated)
        {
            return <components.tools.ConfirmationDropdown
                        onClick={ (ok) => this.handleLogoutAllClick(ok) }
                        message={"Logout on all devices"}
                        positiveMessage={"Logout"}
                        negativeMessage={"Never mind"}
            />;
        }
    }

    private handleLogoutClick( ok : boolean )
    {
        if (ok)
        {
            if (this.props.close != null)
                this.props.close();
            this.props.logout();
        }
    }

    private handleLogoutAllClick( ok : boolean )
    {
        if (ok)
        {
            if (this.props.close != null)
                this.props.close();
            this.props.logoutOnAllDevices();
        }
    }

}
