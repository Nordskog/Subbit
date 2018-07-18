import * as React from 'react';

import * as models from '~/common/models';

import * as siteStyles from 'css/site.scss'

import SVGInline from "react-svg-inline"


//File-loader
import * as loading_animation from 'assets/animations/loading_animation.svg';
import * as loading_done from 'assets/animations/loading_done.svg';
import * as loading_error from 'assets/animations/loading_error.svg';
import * as loading_end from 'assets/animations/loading_end.svg';

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

        let image : any = null;
        switch(this.props.status)
        {
            case  models.LoadingStatus.ERROR:
            case models.LoadingStatus.EMPTY:
            {
                image = loading_error;
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

        return <SVGInline className={siteStyles.loadingImage} svg={image}/>
    
    }


    render()
    {
        return this.getImage();
    }
}