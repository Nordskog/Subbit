import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State )
{

    return { 
        postDisplay: state.userState.settings.post_display_mode,
        authenticated: state.authState.isAuthenticated,
        statsAccess: state.authState.isAuthenticated && state.authState.user.id_token.stats_access
    }
}

function mapDispatchToProps(dispatch : Dispatch, ownProps) : object
{
    return {
        changePostDisplay: ( mode: models.PostDisplay  ) => { dispatch(actions.posts.changePostDisplay(mode) ) },
        logoutOnAllDevices: () => { dispatch(actions.authentication.logoutUserOnAllDevices() )  },
        logout: () => { dispatch(actions.authentication.logoutUserAction() )  }
        };
    
}


const userSettingsComponent =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default userSettingsComponent;