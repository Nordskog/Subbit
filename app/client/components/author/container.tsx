import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import * as models from '~/common/models'

function mapStateToProps(state: State )
{

    return { authors: state.authorState.authors, 
        filter: state.authorState.filter,
        lastVisit: state.authState.isAuthenticated ? state.authState.user.last_visit : 0
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return { subscribe: (author: string) => { dispatch(actions.subscription.subscribeToAuthorAction(author)) }, 
                 unsubscribe: (sub: models.data.Subscription) => { dispatch(actions.subscription.unsubscribeFromAuthor(sub)) },
                 getPostDetails: (authors: models.data.AuthorEntry[]) => { dispatch(actions.authors.getPostInfoAction(authors, 0)) },
                 getMorePosts: (author : models.data.AuthorEntry, count : number, offset : number) => { dispatch(actions.authors.getMorePosts(author, count, offset)) },
                 addSubscriptionSubreddit: (subscriptionId : number, subredditId : number) => { dispatch(actions.subscription.addSubredditToSubscriptionAction(subscriptionId, subredditId)) },
                 removeSubscriptionSubreddit: (subscriptionId : number, subredditId : number) => { dispatch(actions.subscription.removeSubredditFromSubscriptionAction(subscriptionId, subredditId)) }
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