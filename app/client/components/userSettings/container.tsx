import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';

function mapStateToProps(state: State )
{

    return { 
        postDisplay: state.userState.settings.post_display_mode
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return {
            changePostDisplay: ( mode: models.PostDisplay  ) => { dispatch(actions.posts.changePostDisplay(mode) ) },
          };
    }
}


const userSettingsComponent =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default userSettingsComponent;