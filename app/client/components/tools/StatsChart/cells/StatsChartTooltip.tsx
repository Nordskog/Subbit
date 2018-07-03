import * as React from 'react';

import * as styles from 'css/stats.scss'

interface Props
{
  x : number;
  y : number;
}

interface State
{
  
}

export default class StatsChartTooltip extends React.Component<any,any> 
{

  render() 
  {


    let {x, y, width, height, datum, formatTooltip } = this.props;

    let textStyle = {
        fontSize: "12",
        padding: "5"
    };


    return <g style={ { overflow: 'visible' } }>
            <foreignObject 
                style={ { overflow: 'visible' }}
                width="150" 
                height="1"
                x={x} 
                y={0 - 40} >
               <div className={styles.text} >
                    <div className={styles.textInner}>{formatTooltip(datum.y)}</div>
                </div>
            </foreignObject>

            <circle cx={this.props.x} cy={this.props.y} r="3" fill={"#c43a31"} />
            <line x1={x} y1={0 - 40} x2={x} y2={height} stroke={"#c43a31"} />
            </g>
  }





}


