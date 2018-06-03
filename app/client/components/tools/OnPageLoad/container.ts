import { connect } from 'react-redux';
import OnPageLoadComponent from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapStateToProps(state: State)
{
    return { 
 
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

const OnPageLoad = connect(
       mapStateToProps,
       mapDispatchToProps,
)(OnPageLoadComponent);

export default OnPageLoad;

