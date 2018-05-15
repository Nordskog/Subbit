import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapStateToProps(state: State )
{
    return { subreddits: state.siteState.subreddits,
        subreddit: state.authorState.subreddit,
        filter: state.authorState.filter
    }
}

function mapDispatchToProps(): object
{
    return function (dispatch)
    {
        return {
            changeSubreddit: ( subreddit : string ) => { dispatch(actions.authors.changeSubreddit(subreddit)) },
        }
    }
}

const RedditList = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default RedditList;

