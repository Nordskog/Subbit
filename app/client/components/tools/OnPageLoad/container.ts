import { connect } from 'react-redux';
import OnPageLoadComponent from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State)
{
    return { 
 
    };
}

const OnPageLoad = connect(
       mapStateToProps,
       null,
)(OnPageLoadComponent);

export default OnPageLoad;

