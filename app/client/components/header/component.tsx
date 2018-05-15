import * as React from 'react';
import Link from 'redux-first-router-link'
import { NavLink} from 'redux-first-router-link'

import * as urls from '~/common/urls'
import * as models from '~/common/models'

import * as components from '~/client/components'

import { AuthorFilter } from '~/common/models';


interface Props
{
    authState: models.auth.AuthState;
    filter : models.AuthorFilter;
    subreddit : string;
    logout(): void;
}

export default class HeaderComponent extends React.Component<Props, null>
{
    usernameField;

    constructor(props)
    {
        super(props);

        this.handleLogoutClick = this.handleLogoutClick.bind(this);
    }

    render()
    {
        return <div className="site-header">
                    <div className="site-headerLeft">
                        <a className="site-headerBrand" href="#">RFY</a>
                        <components.tools.RedditList/>
                        <NavLink    className={ this.getButtonStyleIfFilterMatch(AuthorFilter.HOT )}
                                    to={ this.getFilterLink(AuthorFilter.HOT) }>
                                hot
                        </NavLink>

                        <NavLink    className={ this.getButtonStyleIfFilterMatch(AuthorFilter.NEW )}
                                    to={ this.getFilterLink(AuthorFilter.NEW) }>
                                new
                        </NavLink>

                        <NavLink    className={ this.getButtonStyleIfFilterMatch(AuthorFilter.SUBSCRIPTIONS )}
                                    to={ this.getFilterLink(AuthorFilter.SUBSCRIPTIONS) }>
                                subscribed
                        </NavLink>
                        <NavLink    className="site-button"
                                    to={ { type: 'MANAGER' } }>
                                manager
                        </NavLink>
                    </div>
                    <div className="site-headerRight">
                     {this.getPanel()}
                    </div>
                    <div className="site-headerClear"/>
                </div>;
    }

    getButtonStyleIfFilterMatch(filter : string)
    {
        if (filter == this.props.filter)
        {
            return "site-button site-activeButton";
        }
        else
        {
            return "site-button";
        }
    }



    getFilterLink(filter : string)
    {
        if (this.props.subreddit == null)
        {
            return {type: filter.toUpperCase()}
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
        return <div className="site-loginContainer">
                <a href={urls.getLoginUrl()} className="site-button">Login</a>
                </div>;
    }

    getloggedInPanel()
    {
        return <div className="site-loginContainer">
            <div
                className="site-button"
                onClick={this.handleLogoutClick}>logout</div>
             </div>;
    }

   handleLogoutClick()
   {
       this.props.logout();
   }

}