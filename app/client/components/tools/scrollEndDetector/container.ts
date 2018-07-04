import { connect } from 'react-redux';
import ScrollEndDetectorComponent from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State)
{
    return { ...state.siteState };
}

function mapDispatchToProps(dispatch : Dispatch): object
{
    return {
        getNextPage: ( ) => { dispatch(actions.authors.fetchAuthorsAction(true)) }
    }
}

const ScrollEndDetector = connect(
       mapStateToProps,
       mapDispatchToProps,
)(ScrollEndDetectorComponent);

export default ScrollEndDetector;

