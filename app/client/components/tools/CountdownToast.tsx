import * as React from 'react';
import * as toastStyles from 'css/toast.scss'

interface Props
{
    start : number;
    message? : string;
    countdownMessage?: string;
    countdownPostMessage?: string;
}


interface State
{
    countdownStart : number;
    countdown : number;
}

export default class CountdownToastComponent extends React.Component<Props,State>
{
    timer = null;
    state = {countdownStart: null, countdown: null};

    static getDerivedStateFromProps( nextProps : Props, prevState : State )
    {
        if (prevState != null && nextProps.start == prevState.countdownStart)
            return null;

        return { countdownStart: nextProps.start, countdown: nextProps.start };
    }

    componentDidMount() 
    {
        this.timer = setInterval( () => this.updateTime(), 1000);
    }

    componentWillUnmount()
    {
        clearInterval(this.timer);
        this.timer = null;
    }

    updateTime()
    {
        if (this.state.countdown <= 0 && this.timer != null)
        {

            clearInterval(this.timer);
            this.timer = null;
        }
        else
        {
            let newTime = Math.floor( this.state.countdown - 1 );
            this.setState( { countdown: newTime } );
        }
    }

    render()
    {
        return <div className={toastStyles.columnContainer}>
                    {this.getMessage()}
                    {this.getCountdown()}
                </div>
        
        
    }

    getMessage()
    {
        if (this.props.message != null)
            return <span>{this.props.message}</span>
    }

    getCountdown()
    {
        if (this.props.countdownMessage != null && this.props.countdownPostMessage != null)
        {
            return <span>{this.props.countdownMessage} {this.state.countdown} {this.props.countdownPostMessage}</span>
        }
        else if (this.props.countdownMessage != null)
        {
            return <span>{this.props.countdownMessage} {this.state.countdown}</span>
        }
        else
        {
            return <span>{this.state.countdown}</span>
        }
    
    }
}