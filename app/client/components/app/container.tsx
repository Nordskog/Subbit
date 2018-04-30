import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapStateToProps(state: State)
{
    return { 
        mode: state.siteState.mode
    };
}

function mapDispatchToProps(): object
{
    return function (dispatch)
    {
        return {
        }
    }
}

const app = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default app;

