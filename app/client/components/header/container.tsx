import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapStateToProps(state: State)
{
    return { 
        authState: state.authState ,
        filter: state.authorState.filter,
        subreddit: state.authorState.subreddit
    };
}

function mapDispatchToProps(): object
{
    return function (dispatch)
    {
        return {
            logout: () => { dispatch(actions.authentication.logoutUserAction()) },
        }
    }
}

const HeaderComponent = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default HeaderComponent;

