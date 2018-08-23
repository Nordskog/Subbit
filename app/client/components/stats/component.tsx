import * as React from 'react';
import * as models from '~/common/models';
import * as components from '~/client/components';

import * as socket from '~/client/websocket';
import { StatsHistory, StatsUpdate, StatsTimeRange, StatsCategoryType, StatsDataEntry } from '~/common/models/stats';
import { StatsChartItem } from '~/client/components/tools/StatsChart';
import StatsChart from '~/client/components/tools/StatsChart/component';
import { time } from '~/common/tools';

import * as styles from 'css/stats.scss';

type StatsChartList = Map<StatsTimeRange, StatsChartItem>;

interface Props
{
  authState : models.auth.AuthState;
}

interface State 
{
  charts : Map<StatsCategoryType, StatsChartList>;
}

export default class StatsComponent extends React.Component<Props,State> 
{

  private handleConnectCallback : models.WebsocketReconnectCallback;

  constructor( props : Props)
  {
    super(props);
    this.state = { charts: new Map<StatsCategoryType, StatsChartList>() } ;

    // So we can add/remove callback by reference
    this.handleConnectCallback = () => this.handleConnect();
  }
  public componentWillMount()
  {
    if (this.props.authState.isAuthenticated && this.props.authState.user.id_token.stats_access)
    {
      socket.actions.registerForConnectEvent( this.handleConnectCallback );
      socket.actions.connect( this.props.authState.user.access_token );
      
    }
  }

  public componentWillUnmount()
  {
    socket.actions.UnregisterForConnectEvent( this.handleConnectCallback );
    socket.actions.stats.unregisterForStats();
  }

  private handleConnect()
  {
    // Re-register for updates
    socket.actions.stats.registerForStats( (update) => this.handleStatsUpdate(update), (history) => this.handleStatsHistory(history));

    for (let [category, list] of this.state.charts)
    {
      // Request updates history for all graphs
      for (let [timeRange, item] of list)
      {
        socket.actions.stats.requestHistory(  category, timeRange);
      }
      
    }
  }

  private handleStatsUpdate( update : StatsUpdate )
  { 
    let chartObject = this.getChartObject(update.category, update.timeRange);
    if (chartObject != null)
    {
      chartObject.data.push( { x: update.data.end * 1000, y: update.data.value } );

      // Server-side we keep a backlog of 360 or so points of data.
      // When displaying them here, about half of that range seems decent.
      let limit = ( ( Date.now() / 1000 ) - (chartObject.limit / 2) ) * 1000;

      for ( let i = 0; i < chartObject.data.length; i++)
      {
        let data = chartObject.data[i];

        if (data.x > limit)
        {
          break;
        }
        // Will usually only remove a single item before breaking
        chartObject.data.shift();
        i--;
      }
      
      chartObject.end = update.data.end;

      this.setState( { charts: this.state.charts } );

    }

  }

  private handleStatsHistory( history : StatsHistory)
  {
    let chartObject = this.getChartObject(history.category, history.timeRange);
    if (chartObject != null)
    {
      chartObject.data = history.data.map( ( entry : StatsDataEntry ) => 
      {
          return { x: entry.end * 1000 , y: entry.value };
      });

      chartObject.limit = history.limit;
      if (history.data.length > 0)
      {
        chartObject.end = history.data[ history.data.length - 1 ].end;
      }
      else 
        chartObject.end = 0;

      chartObject.minDomain = history.minExpectedValue;

      // Create new new object so component can skip unencessary updates
      this.setState( { charts: this.state.charts } );

    }

  
  }

  public render() 
  {
    if (this.props.authState.isAuthenticated && this.props.authState.user.id_token.stats_access)
    {
      return <div className={styles.container}> 

                <div className={styles.section}>
                Totals
                </div>
                {this.renderChartCategory("Total Users", StatsCategoryType.USERS, true)}
                {this.renderChartCategory("Total Subscriptions", StatsCategoryType.SUBSCRIPTIONS, true)}
                {this.renderChartCategory("Total Authors", StatsCategoryType.AUTHORS, true)}

                <div className={styles.section}>
                System load
                </div>
                {this.renderChartCategory("CPU utilization", StatsCategoryType.CPU_USAGE, true)}
                {this.renderChartCategory("Memory utilization", StatsCategoryType.MEMORY_USAGE, true)}

                <div className={styles.section}>
                Statistics
                </div>
                {this.renderChartCategory("Page loads", StatsCategoryType.PAGE_LOADS)}
                {this.renderChartCategory("User page loads", StatsCategoryType.USER_PAGE_LOADS)}
                {this.renderChartCategory("Successful logins", StatsCategoryType.SUCCESSFUL_LOGINS)}
                {this.renderChartCategory("Failed logins", StatsCategoryType.FAILED_LOGINS)}
                {this.renderChartCategory("Errors", StatsCategoryType.ERRORS)}

            </div>;
    }
    else
    {
      return <div>You're not allowed to see this</div>;
    }
  }

  public getLabelSuffix( category : StatsCategoryType)
  {
    switch(category)
    {
      case StatsCategoryType.MEMORY_USAGE:
        return "MB";
      default:
        return "";
    }
  }

  public formatTooltip( value : number, category : StatsCategoryType) : string
  {
    switch(category)
    {
      case StatsCategoryType.MEMORY_USAGE:
        return `${Math.floor(value ).toLocaleString( undefined ) } MB`;
      default:
        return `${value.toLocaleString( undefined )}`;
    }

  }


  public registerChart( category : StatsCategoryType, timeRange : StatsTimeRange)
  {
    let chartObject = this.getChartObject(category, timeRange);
    if (chartObject != null)
    {
      // Already exists
      return;
    }

    let list : StatsChartList = this.state.charts.get(category);
    if (list == null)
    {
      list = new  Map<StatsTimeRange, StatsChartItem>();
      this.state.charts.set(category, list);
    }

    chartObject = {
      data: [],
      limit: 0,
      category: category,
      timeRange : timeRange,
      end: 0,
      labelSuffix: this.getLabelSuffix(category),
      minDomain: 10
    };

    list.set(timeRange, chartObject);

    // Requet initial state
    // socket.actions.stats.requestHistory( category, timeRange);
  }

  public getChartObject(  category : StatsCategoryType, timeRange : StatsTimeRange )
  {
    let list : StatsChartList = this.state.charts.get(category);
    if (list == null)
      return null;
    
      return list.get(timeRange);
  }

  public renderChartCategory( title : string, category : StatsCategoryType, isCumulative : boolean = false)
  {
      // Timeranges must match what is being tracked on the backend

      return <div className={styles.categoryContainer}> 
      <div className={styles.categoryHeader}>
        <span className={styles.categoryTitle}>{title}</span>
      </div>
      <div className={styles.categoryChartContainer}>
        {this.renderSingleChart( category, StatsTimeRange.MINUTE, isCumulative ? "3 hours" : "Per minute"  )} 
        {this.renderSingleChart( category, StatsTimeRange.HOUR, isCumulative ? "3 days" : "Per hour"  )} 
        {this.renderSingleChart( category, StatsTimeRange.DAY, isCumulative ? "90 days" : "Per day"  )} 
      </div>
    </div>;
  }
 
  public renderSingleChart( category : StatsCategoryType, timeRange : StatsTimeRange, title : string )
  {
    this.registerChart(category, timeRange);

    return <StatsChart
                item={this.getChartObject(category, timeRange)}
                title={title}
                formatTooltip={( value ) => this.formatTooltip(value, category)}
            />;
  }
}
