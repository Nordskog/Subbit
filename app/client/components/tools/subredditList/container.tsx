import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import * as models from '~/common/models'
import * as api from '~/common/api'

function mapStateToProps(state: State )
{

    return { 
        subreddit: state.authorState.subreddit, 
        auth: state.authState.user.redditAuth
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return { 
            
            searchSubreddit: ( name : string ) => { return actions.statelessActions.subreddits.searchSubreddits(name, dispatch) }
        };
    }
}


const author =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default author;