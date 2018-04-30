import { connect } from 'react-redux';
import OnPageLoadComponent from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapDispatchToProps(): object
{
    return function (dispatch)
    {
        return {
            updatePostDetails: ( ) => { dispatch(actions.authors.getAllPostInfoAction()) }
        }
    }
}

const OnPageLoad = connect(
       null,
       mapDispatchToProps,
)(OnPageLoadComponent);

export default OnPageLoad;

