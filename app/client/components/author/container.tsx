import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import * as models from '~/common/models'
import { Dispatch } from '~/client/actions/tools/types';

function mapStateToProps(state: State )
{

    return { 
        subreddit: state.authorState.subreddit, 
        postDisplay: state.userState.settings.post_display_mode,
        solo: state.authorState.author != null,
        authenticated: state.authState.isAuthenticated,

    }
}

function mapDispatchToProps(dispatch: Dispatch) : object
{
    return { searchSubreddits: ( name : string ) => { return actions.statelessActions.subreddits.searchSubreddits(name, dispatch) },
                subscribe: (author: string, subreddits : string[]) => { dispatch(actions.subscription.subscribeToAuthorAction(author, subreddits)) }, 
                unsubscribe: (sub: models.data.Subscription) => { dispatch(actions.subscription.unsubscribeFromAuthor(sub)) },
                fetchMorePosts: (author : models.data.AuthorEntry, count : number) => { dispatch(actions.authors.fetchMorePosts( [author], count)) },
                addSubscriptionSubreddit: (subscription : number, subreddit : string) => { dispatch(actions.subscription.addSubredditToSubscriptionAction(subscription, subreddit)) },
                removeSubscriptionSubreddit: (subscription : number, subreddit : string) => { dispatch(actions.subscription.removeSubredditFromSubscriptionAction(subscription, subreddit)) },
                goToSubscriptions: () => { dispatch(actions.authors.changeFilter(models.AuthorFilter.SUBSCRIPTIONS)) },
    };
}


const author =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default author;