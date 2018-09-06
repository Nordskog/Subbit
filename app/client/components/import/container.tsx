import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store';

import * as actions from '~/client/actions';
import { Dispatch } from '~/client/actions/tools/types';
import { AuthorFilter } from '~/common/models';
import { subreddit } from 'css/post.scss';

function additionalAuthIsValid(state: State)
{

    if ( !state.authState.isAuthenticated )
        return false;

    if ( state.authState.user.reddit_auth_additional == null )
        return false;

    // If within 5min of expiring
    if ( state.authState.user.reddit_auth_additional.expiry < ( Date.now() / 1000 ) + ( 60 * 5) )
        return false;

    return true;
}

function mapStateToProps(state: State)
{
    return { 
        AdditionalAuthValid: additionalAuthIsValid(state),

    };
}

function mapDispatchToProps( dispatch : Dispatch): object
{
        return {
            checkForRecentUpdateMeBotListRequest: () => actions.statelessActions.importing.checkForRecentUpdateMeBotListRequest( dispatch ),
            checkForUpdateMeNowReply: () => actions.statelessActions.importing.checkForUpdateMeBotReply( dispatch ),
            requestSubscriptionsFromUpdateMeBot: () => actions.statelessActions.importing.requestSubscriptionsFromUpdateMeBot( dispatch ),
            navigateToImported: () => dispatch( actions.authors.changeFilter( AuthorFilter.IMPORTED ) )
        };
}

const importComponent = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default importComponent as any;

