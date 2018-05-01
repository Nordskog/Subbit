import * as React from 'react';
import { Link } from 'react-router-dom';
import * as component from '~/client/components/'
import * as models from '~/common/models';
import * as api from '~/common/api'
import * as websocket from '~/client/websocket'


import * as styles from 'css/manager.scss'

interface Props 
{
    getUpdatedJobs ( after: number ) : void;

}

interface State
{
    lastUpdate : number;
}

export default class managerComponent extends React.Component<Props, State >
{
    constructor( props : Props)
    {
        super(props);
    }

    componentWillMount()
    {
        if ( process.env.IS_CLIENT )
        {
            websocket.manager.socket.connect();
        }
    }


    componentWillUnmount()
    {
        websocket.manager.socket.disconnect();
    }

    public render()
    {
        return <div className={ styles.outerContainer }>
                <component.settings.component />
                <component.scrapeBot.component />
                <component.managedSubreddits />
            </div>
    }


};
