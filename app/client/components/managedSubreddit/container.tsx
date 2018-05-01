import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '~/client/store';
import component from './component';

import * as actions from '~/client/actions';
import * as models from '~/common/models';
import * as serverActions from '~/backend/actions'

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
            requestScrape: ( request : serverActions.scrape.REQUEST_SCRAPE ) => { dispatch(actions.manager.requestScrape(request)) },
            updateJob: ( modifiedJob: models.data.ScrapeJob ) => { dispatch(actions.manager.modifyScrapeJobLocally(modifiedJob)) },
            cancelJob: ( job: number  ) => { dispatch(actions.manager.cancelScrape(job)) },
            removeSubreddit: ( subreddit: models.data.Subreddit  ) => { dispatch(actions.subreddits.removeSubreddit(subreddit) ) },
          };
    }
}


const managerComponent =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default managerComponent;