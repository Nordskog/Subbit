import * as React from 'react';
import { Link } from 'react-router-dom';

import Popup from "reactjs-popup";

import * as styles from 'css/subredditList.scss'

import * as components from '~/client/components/'
import * as models from '~/common/models';

import expand_caret from 'assets/images/expand_caret.svg'
import collapse_caret from 'assets/images/collapse_caret.svg'

interface Props 
{
    trigger : JSX.Element;
    subreddits: components.tools.subredditList.displayedSubreddit[];
    onClick( subreddit : components.tools.subredditList.displayedSubreddit, close : () => void ) : void;
    toggleHighlight: boolean;
    addToDisplayList: boolean;
}

interface State
{
    
}



export default class popup extends React.Component<Props, State >
{

    constructor(props : Props)
    {
        super(props);
    }

    public render()
    {
        let style = 
        {
            'width': 'auto',
            'border': '0px',
            'background':'transparent'
        }

            return <Popup   trigger={ this.props.trigger } 
                            contentStyle={style} 
                            position="bottom left" closeOnDocumentClick
                            arrow={false}
                                                >
                        {
                            close => 
                            {
                                 return <div className={styles.popupContainer}>
                                            <components.tools.subredditList.component
                                                    subreddits={this.props.subreddits} 
                                                    onClick={ (subreddit : components.tools.subredditList.displayedSubreddit ) => 
                                                    { 
                                                        this.props.onClick(subreddit, close);
                                                    }}
                                                    toggleHighlight={this.props.toggleHighlight}
                                                    addToDisplayList={this.props.addToDisplayList} />
                                            </div>

                            }
                        }
                    </Popup>
    }
};
