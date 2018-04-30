import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';

function mapStateToProps(state: State )
{

    return { 
        subreddits : state.managerState.subreddits
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return { 
           
         };
    }
}


const managerComponent =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default managerComponent;