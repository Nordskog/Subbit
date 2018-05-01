import * as React from 'react';
import { Link } from 'react-router-dom';

import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import * as api from '~/common/api'


interface Props
{
    updatePostDetails(): void;
}

export default class OnPageLoadComponent extends React.Component<Props, null>
{

    componentWillMount()
    {
        this.props.updatePostDetails();
    }

    render()
    {
        return <div> </div>
    }
    
}