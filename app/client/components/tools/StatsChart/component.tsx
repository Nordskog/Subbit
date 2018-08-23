import * as React from 'react';
import * as models from '~/common/models';

import * as socket from '~/client/websocket';
import { StatsHistory, StatsUpdate, StatsCategoryType, StatsTimeRange } from '~/common/models/stats';

import * as styles from 'css/stats.scss';

import * as cells from './cells';

// For tree shaking purposes
// import { VictoryChart, VictoryVoronoiContainer, VictoryAxis, VictoryArea  } from 'victory';
import { VictoryChart } from 'victory-chart';
import { VictoryVoronoiContainer } from 'victory-voronoi-container';
import { VictoryAxis } from 'victory-axis';
import { VictoryArea } from 'victory-area';

import theme from './theme';

// Warning: Failed prop type: Invalid prop `domain` supplied to `VictoryArea`.
// See https://github.com/FormidableLabs/victory/issues/659

export interface StatsChartItem
{
  data : { x: number, y: number}[];
  category: StatsCategoryType;
  timeRange : StatsTimeRange;
  limit : number; // Unix time duration
  minDomain : number;
  labelSuffix : string;
  end : number; // unix time of latest entry

}

interface Props
{
  item : StatsChartItem;
  title : string;
  formatTooltip( value : number) : string; 
}

interface State
{
  end : number; // Convenient way of telling when data has been updated
}

export default class StatsChartComponent extends React.Component<Props,State> 
{
  public state = { end: 0 };

  public static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
  {
    if ( nextProps.item.end !== prevState.end)
    {
      return { end: nextProps.item.end };
    }
    else
    {
      return null;
    }
  }

  public shouldComponentUpdate( nextProps : Props, nextState : State)
  {
    if ( nextState.end !== this.state.end )
    {
      return true;
    }

    return false;
  }

  public render() 
  {
    return this.getChart();
  }

  private getData()
  {
    if (this.props.item == null)
    {
      return [];
    }
    else
    {
      return this.props.item.data;
    }
  }

  private getChart( )
  {
    let labelSize : number = 15;

    let height = 100;
    let width = 350;

    return <div className={styles.chartContainer}>

    <div className={styles.chartTitle}>
    {this.props.title}
    </div>
    
    <VictoryChart 
              scale={ {x: "time", y: "linear"}}
              theme={theme as any}
              padding={ { top: 0, bottom: 10, left: 80, right: 20 }}
              height={100}
              width={350}
              containerComponent={
                <VictoryVoronoiContainer labelComponent={<cells.StatsChartTooltip height={height} width={width} formatTooltip={this.props.formatTooltip} /> }  voronoiDimension="x" labels={(d) =>  d }/>
              }
              >

                <VictoryAxis
                  style={{
                    axisLabel: {fontSize: labelSize, padding: 30},
                    tickLabels: {fontSize: labelSize, padding: 5}
                  }}
                  tickCount={3}
                  />

                <VictoryAxis

                  dependentAxis={true}
                  style={{
                    axisLabel: {fontSize: labelSize, padding: 30},
                    tickLabels: {fontSize: labelSize, padding: 5}
                    
                  }}
                  tickFormat={ (value) => this.props.formatTooltip(value) }
                  tickCount={3}
                  domain={ [0, this.props.item.minDomain] }
                  />

                  
                  <VictoryArea
                        data={this.getData()}
                        style={{ data: { stroke: "#c43a31", fill: "#70201a" }}}
                    />

            </VictoryChart>

            </div>;
  }
}
