import * as React from 'react';
import Link from 'redux-first-router-link'
import { NavLink} from 'redux-first-router-link'

import * as urls from '~/common/urls'
import * as models from '~/common/models'

import * as components from '~/client/components'

import { AuthorFilter, PostTimeRange } from '~/common/models';

import * as siteStyles from 'css/site.scss';
import * as styles from 'css/header.scss'

import * as transitions from 'react-transition-group'
import { spawn } from 'child_process';

import * as actions from '~/client/actions'

import subbit_logo from 'assets/images/subbit_logo.svg'

import * as toast from '~/client/toast'
interface Props
{
    authState: models.auth.AuthState;
    filter : models.AuthorFilter;
    subreddit : string;
    time: PostTimeRange;
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
                    <div className={styles.headerLeft}>
                        <div className={styles.headerRow}>
                        
                            {this.getLogo()}
                            <components.animations.AutoWidth>
                                <components.tools.SubredditDropdown/>
                            </components.animations.AutoWidth>
                        </div>

                        <div className={styles.headerColumn}>
                            <transitions.TransitionGroup component="div" className={styles.headerRow}>
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
                            <transitions.TransitionGroup component="div">
                                {this.getTopTimePanels()}
                            </transitions.TransitionGroup>
                        </div>
                    </div>
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

    getLogo()
    {
        return <a className={styles.logoContainer} href="#">
                    <svg className={styles.logo} >
                        <use xlinkHref={subbit_logo}></use>
                    </svg>
                </a>
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
            return { type: actions.types.Route.FILTER, payload: { filter: filter } as actions.types.Route.FILTER };
        }
        else
        {
           return { type: actions.types.Route.SUBREDDIT, payload: { subreddit: this.props.subreddit, filter } as actions.types.Route.SUBREDDIT };
        }
    }

    getPanel()
    {
        if (this.props.authState.isAuthenticated)
            return this.getloggedInPanel();
        else
            return this.getLoginPanel();
    }

    
    getTopTimePanels()
    {
        if (this.props.filter !=  AuthorFilter.TOP )
            return null;

        let elements = [
            this.getTopTimePanel("hour", PostTimeRange.HOUR),
            this.getTopTimePanel("day", PostTimeRange.DAY),
            this.getTopTimePanel("week", PostTimeRange.WEEK),
            this.getTopTimePanel("month", PostTimeRange.MONTH),
            this.getTopTimePanel("year", PostTimeRange.YEAR),
            this.getTopTimePanel("all", PostTimeRange.ALL),

        ];

        return <components.transitions.FadeResize  key={"top_time_links"}>
                    <div className={ `${styles.headerRow} ${styles.topTimeContainer}` }>
                        {elements}
                    </div>
                </components.transitions.FadeResize>   
    }

    getTopTimePanel( display : string, time : PostTimeRange)
    {

        return <NavLink    className={ this.props.time == time ? styles.sortButtonActiveSub : styles.sortButtonSub }
                            to={ this.getTopLink(time) }>
                            {display}
                </NavLink>
                 
    }

    getTopLink(time : models.PostTimeRange)
    {
        if (this.props.subreddit == null)
        {
            return { type: actions.types.Route.FILTER, payload: { filter: AuthorFilter.TOP, time: time  } as actions.types.Route.FILTER };
        }
        else
        {
           return { type: actions.types.Route.SUBREDDIT, payload: { subreddit: this.props.subreddit, filter: AuthorFilter.TOP, time: time } as actions.types.Route.SUBREDDIT };
        }
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