import * as React from 'react';
import { Link } from 'react-router-dom';

import * as component from '~/client/components/'
import * as models from '~/common/models';

import 'css/manager.scss'
import { Context } from 'vm';

interface Props 
{
    subreddits: models.data.Subreddit[];
}

export default class managerComponent extends React.Component<Props, null >
{
    renderAuthors()
    {
        return this.props.subreddits.map( (subreddit : models.data.Subreddit) =>
        {
           return <component.managedSubreddit.component subreddit={subreddit} key={subreddit.id} />
        } )
    }

    shouldComponentUpdate(nextProps : Props, nextstate : null, nextContext : Context)
    {
        if (nextProps.subreddits != this.props.subreddits)
        {
            return true;
        }

        return false;
    }

    public render()
    {
        
        return <div className="manager-container">
                        {
                            this.renderAuthors()
                        }
        </div>;
        
    }


};
