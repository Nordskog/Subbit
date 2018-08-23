import * as React from 'react';


import * as models from '~/common/models';

import * as tools from '~/common/tools';
import * as urls from '~/common/urls';

import * as authorStyles from 'css/author.scss';

interface Props
{
    lastVisit: number;
}

export default class LastVisitBar extends React.Component<Props, null>
{
    public render()
    {
        return <div className={authorStyles.lastVisit}>
                      {this.getTimeSince()}

                </div>;
    }

    private getTimeSince()
    {
        return <span>Your last visit {tools.time.getTimeSinceDisplayString(this.props.lastVisit)} </span>;
    }


    
}
