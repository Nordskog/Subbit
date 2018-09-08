import * as React from 'react';

import * as models from '~/common/models';

import SVGInline from "react-svg-inline";
import * as expand_caret from 'assets/images/expand_caret.svg';

import * as SearchList from '~/client/components/tools/SearchList';
import { Popup } from '~/client/components/tools';

import * as styles from "css/redditlist.scss";
import { ListItem } from '~/client/components/tools/SearchList';
import { AuthorFilter } from '~/common/models';
import { getFilterDisplayString } from '~/common/tools/string';
import { NavLink } from 'redux-first-router-link';
import * as actions from '~/client/actions';

interface Props
{
    subreddit : string;
    changeFilter( filter : models.AuthorFilter, subreddit : string ) : void; 
    filter : models.AuthorFilter;
    modal? : boolean;
}

interface State
{
    filters : SearchList.ListItem[];
}


export default class FilterDropdown extends React.Component<Props, State>
{
    public state = { filters: [] };
    
    public static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
    {
        // Only used by mobile, so place subscriptions at the top so it's easy to find.
        let filters: SearchList.ListItem[]  = 
        [
            FilterDropdown.getFilterItem(  models.AuthorFilter.SUBSCRIPTIONS),
        ];

        // Best only available on front page
        if ( nextProps.subreddit == null )
        {
            filters.push( FilterDropdown.getFilterItem(  models.AuthorFilter.BEST) );
        }

        // The rest
        filters = filters.concat
        ([
            FilterDropdown.getFilterItem(  models.AuthorFilter.HOT),
            FilterDropdown.getFilterItem(  models.AuthorFilter.NEW),
            FilterDropdown.getFilterItem(  models.AuthorFilter.TOP),
            FilterDropdown.getFilterItem(  models.AuthorFilter.RISING),
            FilterDropdown.getFilterItem(  models.AuthorFilter.CONTROVERSIAL),
        ]);

        return  { filters: filters };
    }

    private static getFilterItem( filter : models.AuthorFilter) : ListItem
    {
        return {
            name: getFilterDisplayString(filter),
            object: filter,
            highlighted: false
        };
    }

    constructor(props)
    {
        super(props);

    }

    public render()
    {
        return this.getFilterDropdown( this.getButton() );

    }

    private getButton()
    {
        return  <div className={styles.container}>

        <div  className={styles.selectedContainer}>
            <div className={styles.selected}>
                {this.getCurrentFilter()}
            </div>
            <div className={styles.expandButtonContainer}>
                {this.getExpandCaret()}
            </div>
        </div>

    </div>;
    }

    private getCurrentFilter()
    {
        let filter = this.props.filter;
        if (filter == null)
            filter = models.AuthorFilter.BEST;
        return <span><b>{ getFilterDisplayString(filter)}</b></span>;
    }

    private getFilterDropdown( trigger : JSX.Element ) : JSX.Element
    {
        // Note that the onClick does not include the subreddit if we select subs.
        let filters : SearchList.SearchItem = {
            prefix: "",
            toggleHighlight: false,
            displayHighlight : false,
            addToDisplayList : false,
            items: this.state.filters,
            itemComponent: ( item : SearchList.ListItem, containerStyle : string  ) =>
            {                
               return   <NavLink className={ containerStyle }
                            to={ this.getFilterLink(item.object) }>
                            <b>{item.name}</b>
                        </NavLink>; 
            },
        };



        return <SearchList.popup
                                trigger={ trigger }
                                items={[filters]} 
                                position={Popup.Position.BOTTOM}
                                alignment={Popup.Alignment.BEGINNING}
                                modal={this.props.modal}
        />;
    
    }

    private getFilterLink(filter : models.AuthorFilter)
    {
        if (this.props.subreddit == null || filter === AuthorFilter.SUBSCRIPTIONS)
        {
            return { type: actions.types.Route.FILTER, payload: { filter: filter } as actions.types.Route.FILTER };
        }
        else
        {
           return { type: actions.types.Route.SUBREDDIT, payload: { subreddit: this.props.subreddit, filter } as actions.types.Route.SUBREDDIT };
        }
    }

    private getExpandCaret()
    {
        return  <SVGInline className={styles.expandButton} svg={expand_caret}/>;
    }
}
