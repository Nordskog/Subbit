import * as React from 'react';

import * as models from '~/common/models';

import * as siteStyles from 'css/site.scss'

import ReactSVG from 'react-svg'


//File-loader
import loading_animation = require('assets/animations/loading_animation.svg')
import loading_done = require('assets/animations/loading_done.svg')
import loading_error = require('assets/animations/loading_error.svg')
import loading_end = require('assets/animations/loading_end.svg')

interface Props
{
    status : models.LoadingStatus;
}

interface State
{

}

export default class LoadingIndicator extends React.Component<Props, State>
{
    shouldComponentUpdate(nextProps : Props, nextState : State)
    {
        //Animation is reset on re-render, so avoid updates
        if (this.props.status == nextProps.status)
        {
            return false;
        }

        return true;
    }

    getImage()
    {

        let image : string = null;
        switch(this.props.status)
        {
            case  models.LoadingStatus.ERROR:
            case models.LoadingStatus.EMPTY:
            {
                image = loading_error as string;
                break;
            }
            case models.LoadingStatus.END:
            {
                image = loading_end;
                break;
            }
            case models.LoadingStatus.DONE:
            {
                image = loading_done;
                break;
            }

            default:
            {
                image = loading_animation;
            }
        }

        return <ReactSVG className={siteStyles.loadingImage}
                path={image}
                evalScripts={"never"}
        />    
    }

    render()
    {
        return this.getImage();
    }
}