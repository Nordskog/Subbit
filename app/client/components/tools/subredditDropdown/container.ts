import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'

function mapStateToProps(state: State )
{
    return { 
        subscriptions: state.userState.subscriptions,
        subreddit: state.authorState.subreddit,
        filter: state.authorState.filter
    }
}

function mapDispatchToProps(): object
{
    return function (dispatch)
    {
        return {
            searchSubreddit: ( name : string ) => { return actions.statelessActions.subreddits.searchSubreddits(name, dispatch) },
            searchAuthor: ( name : string ) => { return actions.statelessActions.subreddits.searchSubreddits(name, dispatch) },
            changeSubreddit: ( subreddit : string ) => { dispatch(actions.authors.changeSubreddit(subreddit)) },
            viewAuthor: ( author: string, subreddit? : string ) => { dispatch(actions.authors.viewAuthor( author, subreddit)) },
        }
    }
}

const RedditList = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default RedditList;
