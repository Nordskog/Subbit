import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State)
{
    return { 
        authState: state.authState ,
        filter: state.authorState.filter,
        subreddit: state.authorState.subreddit,
        author: state.authorState.author,
        time: state.authorState.time
    };
}

function mapDispatchToProps( dispatch : Dispatch): object
{
        return {
            logout: () => { dispatch(actions.authentication.logoutUserAction()) },
        }
}

const HeaderComponent = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default HeaderComponent;

