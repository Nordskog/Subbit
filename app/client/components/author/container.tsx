import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import * as models from '~/common/models'

function mapStateToProps(state: State )
{

    return { 
        subreddit: state.authorState.subreddit, 
        postDisplay: state.userState.postDisplay
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return { searchSubreddits: ( name : string ) => { return actions.statelessActions.subreddits.searchSubreddits(name, dispatch) },
                 subscribe: (author: string, subreddits : string[]) => { dispatch(actions.subscription.subscribeToAuthorAction(author, subreddits)) }, 
                 unsubscribe: (sub: models.data.Subscription) => { dispatch(actions.subscription.unsubscribeFromAuthor(sub)) },
                 getPostDetails: (authors: models.data.AuthorEntry[]) => { dispatch(actions.authors.getPostInfoAction(authors, 0)) },
                 fetchMorePosts: (author : models.data.AuthorEntry, count : number) => { dispatch(actions.authors.fetchMorePosts( [author], count)) },
                 addSubscriptionSubreddit: (subscription : number, subreddit : string) => { dispatch(actions.subscription.addSubredditToSubscriptionAction(subscription, subreddit)) },
                 removeSubscriptionSubreddit: (subscription : number, subreddit : string) => { dispatch(actions.subscription.removeSubredditFromSubscriptionAction(subscription, subreddit)) }
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