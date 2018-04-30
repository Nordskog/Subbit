import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'


interface Props
{
    lastVisit: number;
}

export default class LastVisitBar extends React.Component<Props, null>
{
    render()
    {
        return <div className="author-lastVisit">
                      {this.getTimeSince()}

                </div>
    }

    getTimeSince()
    {
        return <span>Your last visit {tools.time.getTimeSinceDisplayString(this.props.lastVisit)} </span>;
    }


    
}