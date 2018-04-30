import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';

function mapStateToProps(state: State )
{

    return { 
       
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return {
            getUpdatedJobs: ( after: number ) => { dispatch(actions.manager.getUpdatedJobs(after)) },
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