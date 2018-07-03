import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State)
{
    return { authState : state.authState };
}

function mapDispatchToProps( dispatch : Dispatch): object
{
        return { }
}

const StatsComponent = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default StatsComponent;

