import { connect } from 'react-redux';
import ScrollEndDetectorComponent from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapStateToProps(state: State)
{
    return { ...state.scrollState };
}

function mapDispatchToProps(): object
{
    return function (dispatch)
    {
        return {
            getNextPage: (page: number ) => { dispatch(actions.authors.fetchAuthorsAction(page, true)) }
        }
    }
}

const ScrollEndDetector = connect(
       mapStateToProps,
       mapDispatchToProps,
)(ScrollEndDetectorComponent);

export default ScrollEndDetector;

