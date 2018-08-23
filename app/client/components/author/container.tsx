import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store';

import * as actions from '~/client/actions';
import * as models from '~/common/models';
import { Dispatch } from '~/client/actions/tools/types';
import { Subscription } from '~/common/models/data';

function mapStateToProps(state: State )
{

    return { 
        subreddit: state.authorState.subreddit, 
        postDisplay: state.userState.settings.post_display_mode,
        solo: state.authorState.author != null,
        authenticated: state.authState.isAuthenticated,
        filter: state.authorState.filter

    };
}

function mapDispatchToProps(dispatch: Dispatch) : object
{
    return { searchSubreddits: ( name : string ) =>  actions.statelessActions.subreddits.searchSubreddits(name, dispatch),
                subscribe: (author: string, subreddits : string[]) => { dispatch(actions.subscription.subscribeToAuthorAction(author, subreddits)); }, 
                unsubscribe: (sub: models.data.Subscription) => { dispatch(actions.subscription.unsubscribeFromAuthor(sub)); },
                fetchPosts: (author : models.data.AuthorEntry, count : number) => { dispatch(actions.authors.fetchNewPosts( author, count)); },
                fetchMorePosts: (author : models.data.AuthorEntry, count : number) => { dispatch(actions.authors.fetchMorePosts( author, count)); },
                addSubscriptionSubreddit: (subscription : Subscription, subreddit : string) => { dispatch(actions.subscription.addSubredditToSubscriptionAction(subscription, subreddit)); },
                removeSubscriptionSubreddit: (subscription : Subscription, subreddit : string) => { dispatch(actions.subscription.removeSubredditFromSubscriptionAction(subscription, subreddit)); },
                goToSubscriptions: () => { dispatch(actions.authors.changeFilter(models.AuthorFilter.SUBSCRIPTIONS)); },
    };
}

export default connect(
            mapStateToProps,
            mapDispatchToProps,
)
    (component) as any; // I give up
