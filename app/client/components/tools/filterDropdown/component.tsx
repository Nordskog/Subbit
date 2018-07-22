import * as React from 'react';
import { NavLink} from 'redux-first-router-link'
import Link from 'redux-first-router-link'


import * as models from '~/common/models';

import * as tools from '~/common/tools'
import * as urls from '~/common/urls'

import SVGInline from "react-svg-inline"
import * as expand_caret from 'assets/images/expand_caret.svg'

import * as components from '~/client/components'

import * as styles from "css/redditlist.scss"
import { ListItem } from '~/client/components/tools/SearchList';
import { AuthorFilter } from '~/common/models';
import { getFilterDisplayString } from '~/common/tools/string';

interface Props
{
    subreddit : string;
    changeFilter( filter : models.AuthorFilter, subreddit : string ) : void; 
    filter : models.AuthorFilter;
    modal? : boolean;
}

interface State
{
    filters : components.tools.SearchList.ListItem[];
}


export default class FilterDropdown extends React.Component<Props, State>
{
    state = { filters: [] };
    
    static getDerivedStateFromProps( nextProps : Props, prevState : State) : State
    {
        //Only used by mobile, so place subscriptions at the top so it's easy to find.
        let filters: components.tools.SearchList.ListItem[]  = 
        [
            FilterDropdown.getFilterItem(  models.AuthorFilter.SUBSCRIPTIONS),
            FilterDropdown.getFilterItem(  models.AuthorFilter.HOT),
            FilterDropdown.getFilterItem(  models.AuthorFilter.NEW),
            FilterDropdown.getFilterItem(  models.AuthorFilter.TOP),
            FilterDropdown.getFilterItem(  models.AuthorFilter.RISING),
            FilterDropdown.getFilterItem(  models.AuthorFilter.CONTROVERSIAL),

        ];

        if ( nextProps.subreddit == null )
        {
            filters.unshift( FilterDropdown.getFilterItem(  models.AuthorFilter.BEST) );
        }

        return  { filters: filters };
    }

    static getFilterItem( filter : models.AuthorFilter) : ListItem
    {
        return {
            name: getFilterDisplayString(filter),
            object: filter,
            highlighted: false
        }
    }

    constructor(props)
    {
        super(props);

    }

    render()
    {
        return this.getFilterDropdown( this.getButton() );

    }

    getButton()
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

    </div>
    }

    getCurrentFilter()
    {
        let filter = this.props.filter;
        if (filter == null)
            filter = models.AuthorFilter.BEST;
        return <span><b>{ getFilterDisplayString(filter)}</b></span>;
    }

    getFilterDropdown( trigger : JSX.Element ) : JSX.Element
    {
        //Note that the onClick does not include the subreddit if we select subs.
        let filters : components.tools.SearchList.SearchItem = {
            prefix: "",
            toggleHighlight: false,
            displayHighlight : false,
            addToDisplayList : false,
            items: this.state.filters,
            onClick: ( item : components.tools.SearchList.ListItem) => { this.props.changeFilter(item.object, item.object == AuthorFilter.SUBSCRIPTIONS ? null : this.props.subreddit); return true; }
        }



        return <components.tools.SearchList.popup
                                trigger={ trigger }
                                items={[filters]} 
                                position={components.tools.Popup.Position.BOTTOM}
                                alignment={components.tools.Popup.Alignment.BEGINNING}
                                modal={this.props.modal}
        />
    
    }

    getExpandCaret()
    {
        return  <SVGInline className={styles.expandButton} svg={expand_caret}/>
    }
}