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
        scrapeBot : state.managerState.scrapeBot
    }
}

function mapDispatchToProps(dispatch, ownProps) : object
{
    return function (dispatch)
    {
        return { 
            toggleScrapebot: ( enabled: boolean  ) => { dispatch( actions.manager.toggleScrapeBot(enabled) ) },
            setScrapeBotInterval: ( interval: number  ) => { dispatch( actions.manager.setScrapeBotInterval(interval) )  },
            setScrapeBotConcurrentRequests: ( concurrent_requests: number  ) => { dispatch( actions.manager.setScrapeBotConcurrentRequests(concurrent_requests) )  },
            scrapeBotScrapeNow: ( ) => { dispatch( actions.manager.scrapeBotScrapeNow() )  },
          };    
    }
}


const scrapeBotComponent =
    connect(
                mapStateToProps,
                mapDispatchToProps,
    )
        (component);

export default scrapeBotComponent;