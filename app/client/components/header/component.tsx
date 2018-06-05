import * as React from 'react';
import Link from 'redux-first-router-link'
import { NavLink} from 'redux-first-router-link'

import * as urls from '~/common/urls'
import * as models from '~/common/models'

import * as components from '~/client/components'

import { AuthorFilter } from '~/common/models';

import * as siteStyles from 'css/site.scss';
import * as styles from 'css/header.scss'

import * as transitions from 'react-transition-group'
import { spawn } from 'child_process';

import * as toast from '~/client/toast'

interface Props
{
    authState: models.auth.AuthState;
    filter : models.AuthorFilter;
    subreddit : string;
    author : string;
    logout(): void;
}

export default class HeaderComponent extends React.Component<Props, null>
{
    usernameField;

    constructor(props)
    {
        super(props);
    }

    render()
    {
        return <div className={styles.header}>
                        
                    <transitions.TransitionGroup component="div" className={styles.headerLeft}>
                        <a className={styles.headerBrand} href="#"></a>
                        <components.animations.AutoWidth>
                            <components.tools.SubredditDropdown/>
                        </components.animations.AutoWidth>
                        <div className={styles.spacer} />
                        { this.getLink( AuthorFilter.BEST, "best") }
                        { this.getLink( AuthorFilter.HOT, "hot") }
                        { this.getLink( AuthorFilter.NEW, "new") }
                        { this.getLink( AuthorFilter.TOP, "top") }
                        { this.getLink( AuthorFilter.RISING, "rising") }
                        { this.getLink( AuthorFilter.CONTROVERSIAL, "controversial") }
                        <div className={styles.spacer} />
                        { this.getLink( AuthorFilter.SUBSCRIPTIONS, "subscribed") }
                    </transitions.TransitionGroup>
                    <div className={styles.headerRight}>
                    {this.getSettingsPanel()}
                     {this.getPanel()}
                    </div>
                    <div className={styles.headerClear}/>
                </div>
    }

    getLink( filter : AuthorFilter, display : string)
    {

        if (this.props.subreddit != null && filter == AuthorFilter.BEST)
            return null;

        return <components.transitions.FadeHorizontalResize key={"filterlink_"+display}>
                    <NavLink    className={ this.getButtonStyleIfFilterMatch(filter )}
                        to={ this.getFilterLink(filter) }>
                        {display}
                    </NavLink>
                </components.transitions.FadeHorizontalResize>   
    }

    getManagerLink()
    {
        return <NavLink    className={styles.sortButton}
                    to={ { type: 'MANAGER' } }>
                    manager
                </NavLink>
    }

    getButtonStyleIfFilterMatch(filter : string)
    {
        if (filter == this.props.filter)
        {
            return  `${siteStyles.button} ${styles.sortButtonActive}`;
        }
        else
        {
            return styles.sortButton;
        }
    }

    getFilterLink(filter : models.AuthorFilter)
    {
        if (this.props.subreddit == null || filter == AuthorFilter.SUBSCRIPTIONS)
        {
            return { type: 'FILTER', payload: { filter: filter } };
        }
        else
        {
           return { type: 'SUBREDDIT', payload: { subreddit: this.props.subreddit, filter } };
        }
    }

    getPanel()
    {
        if (this.props.authState.isAuthenticated)
            return this.getloggedInPanel();
        else
            return this.getLoginPanel();
    }

    getLoginPanel()
    {
        return <div className={siteStyles.loginContainer}>
                <a href={urls.RFY_AUTHORIZE_REMOTE} className={styles.sortButton}>Login</a>
                </div>;
    }

    getloggedInPanel()
    {
        return <div className={siteStyles.loginContainer}>
            <div
                className={styles.sortButton}
                onClick={() => this.handleLogoutClick() }>logout</div>
             </div>;
    }

    getSettingsPanel()
    {
        return <components.userSettings.Popup />
    }

   handleLogoutClick()
   {
       this.props.logout();
   }

}