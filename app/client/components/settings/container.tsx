import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';

function mapStateToProps(state: State )
{

    return { 
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return {
            addSubreddit: ( subreddit: string  ) => { dispatch(actions.subreddits.addSubreddit(subreddit) ) },
            pruneAuthorsWithNoPosts: ( ) => { dispatch(actions.manager.pruneAuthorsWithNoPosts() ) },
            updatePostHotScore: ( ) => { dispatch(actions.manager.updatePostHotScore() ) },
            updateAuthorHotScoreFromPosts: ( ) => { dispatch(actions.manager.updateAuthorHotScoreFromPosts() ) }
          };
    }
}


const managedSettingsComponent =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default managedSettingsComponent;