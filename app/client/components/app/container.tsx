import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State)
{
    return { 
        siteMode: state.siteState.mode,
        authenticated: state.authState.isAuthenticated,
        subscriptionCount: state.userState.subscriptions.length,
        filter : state.authorState.filter
    };
}

function mapDispatchToProps( dispatch: Dispatch) : object
{
    return {   
    };
}

const app = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default app;

