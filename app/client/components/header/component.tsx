import * as React from 'react';
import { NavLink} from 'redux-first-router-link'

import * as urls from '~/common/urls'
import * as models from '~/common/models'

import * as components from '~/client/components'

import { AuthorFilter, PostTimeRange } from '~/common/models';

import * as siteStyles from 'css/site.scss';
import * as styles from 'css/header.scss'

import * as transitions from 'react-transition-group'

import * as actions from '~/client/actions'

import SVGInline from "react-svg-inline"

import * as subbit_logo from 'assets/images/subbit_logo.svg'

import MediaQuery from 'react-responsive'
import { getTimeRangeDisplayString, getFilterDisplayString } from '~/common/tools/string';
import { classConcat } from '~/common/tools/css';

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
        return  <MediaQuery query="screen and (max-width: 1100px)">
                {
                    (matches : boolean) => 
                    {
                        if (matches)
                        {
                            return this.getCompactHeader();
                        }
                        else
                        {
                            return this.getheader();
                        }
                    } 
                }
                </MediaQuery>
    }

    getheader()
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
                                { this.getLink( AuthorFilter.BEST) }
                                { this.getLink( AuthorFilter.HOT) }
                                { this.getLink( AuthorFilter.NEW) }
                                { this.getLink( AuthorFilter.TOP) }
                                { this.getLink( AuthorFilter.RISING) }
                                { this.getLink( AuthorFilter.CONTROVERSIAL) }
                                <div className={styles.spacer} />
                                { this.getLink( AuthorFilter.SUBSCRIPTIONS) }
                            </transitions.TransitionGroup>
                            <transitions.TransitionGroup component="div">
                                {this.getTopTimePanels()}
                            </transitions.TransitionGroup>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                    {this.getSettingsPanel(false)}
                    </div>

                    <div className={styles.headerClear} />
                    
                   
                </div>
    }

    
    getCompactHeader()
    {
        let headerLeftStyles = [];
        headerLeftStyles.push( styles.headerLeft );
        //Enlargen left-floated div to make the right float 
        //line break twice the normal distance, so it appears
        //below the top time range row
        if (this.props.filter == AuthorFilter.TOP)
            headerLeftStyles.push( styles.headerLeftDoubleHeight );


        return <div className={styles.mobileHeaderContainer}>

                    <div className={styles.header}>

                        <div className={ classConcat(...headerLeftStyles) }>
                            <div className={styles.headerColumn}>
                                <div className={styles.headerRow}>
                                    {this.getLogo()}
                                    <div className={styles.mobileScrollContainerOuter}>
                                        <div className={styles.mobileScrollContainer}>
                                            <components.animations.AutoWidth>
                                                <components.tools.SubredditDropdown/>
                                            </components.animations.AutoWidth>

                                            <components.animations.AutoWidth>
                                                <components.tools.FilterDropdown
                                                    modal={true}
                                                />
                                            </components.animations.AutoWidth>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                         <div className={styles.headerRight}>
                            {this.getSettingsPanel(true)}
                        </div>


                        <div className={styles.headerClear} />
                    </div>

                    <transitions.TransitionGroup component="div">
                        {this.getTopTimePanels()}
                    </transitions.TransitionGroup>
                </div>
    }

    getRightCorner()
    {
        return  <div className={ styles.headerRightCornerOuter }>
                    <div className={ styles.headerRightCornerInner } />
                </div>
    }

    getLink( filter : AuthorFilter)
    {

        if (this.props.subreddit != null && filter == AuthorFilter.BEST)
            return null;

        return <components.transitions.FadeHorizontalResize key={"filterlink_"+getFilterDisplayString(filter)}>
                    <NavLink    className={ this.getButtonStyleIfFilterMatch(filter )}
                        to={ this.getFilterLink(filter) }>
                        {getFilterDisplayString(filter)}
                    </NavLink>
                </components.transitions.FadeHorizontalResize>   
    }

    getLogo()
    {
       return   <NavLink    className={ styles.logoContainer }
                     to={ { type: actions.types.Route.HOME, payload: {  } as actions.types.Route.HOME } }>
                    <SVGInline className={styles.logo} svg={subbit_logo}/>
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
            return { type: actions.types.Route.FILTER, payload: { filter: filter } as actions.types.Route.FILTER };
        }
        else
        {
           return { type: actions.types.Route.SUBREDDIT, payload: { subreddit: this.props.subreddit, filter } as actions.types.Route.SUBREDDIT };
        }
    }

    getTopTimePanels()
    {
        if (this.props.filter !=  AuthorFilter.TOP )
            return null;

        let elements = [
            <div key="topTimeMobileSpacer" className={styles.topTimeMobileSpacer}/>,
            this.getTopTimePanel( PostTimeRange.HOUR),
            this.getTopTimePanel( PostTimeRange.DAY),
            this.getTopTimePanel( PostTimeRange.WEEK),
            this.getTopTimePanel( PostTimeRange.MONTH),
            this.getTopTimePanel( PostTimeRange.YEAR),
            this.getTopTimePanel( PostTimeRange.ALL),

        ];

        return <components.transitions.FadeVerticalResize  key={"top_time_links"}>
                    <div className={ `${styles.headerRow} ${styles.topTimeContainer}` }>
                        {elements}
                    </div>
                </components.transitions.FadeVerticalResize>   
    }

    getTopTimePanel( time : PostTimeRange)
    {

        return <NavLink key={time.toString()}   className={ this.props.time == time ? styles.sortButtonActiveSub : styles.sortButtonSub }
                            to={ this.getTopLink(time) }>
                            {getTimeRangeDisplayString(time)}
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


    getSettingsPanel( mobile : boolean = false)
    {
        return <components.userSettings.Popup
                    mobile={mobile}
        />
    }

   handleLogoutClick()
   {
       this.props.logout();
   }

}