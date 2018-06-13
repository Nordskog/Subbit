import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State )
{

    return { authors: state.authorState.authors, 
        filter: state.authorState.filter,
        lastVisit: state.userState.lastVisit
    }
}

function mapDispatchToProps(dispatch: Dispatch) : object
{
    return { 

    };
}


const authors =
    connect(
                mapStateToProps,
                mapDispatchToProps
    )
        (component);

export default authors;