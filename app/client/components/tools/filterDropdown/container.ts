import { connect } from 'react-redux';
import component from './component';
import { State } from '~/client/store'

import * as actions from '~/client/actions'
import { Dispatch } from '~/client/actions/tools/types';
import { AuthorFilter } from '~/common/models';

function mapStateToProps(state: State )
{
    return { 
        subreddit: state.authorState.subreddit,
        filter: state.authorState.filter
    }
}

function mapDispatchToProps( dispatch : Dispatch): object
{
    return {
        changeFilter: ( filter : AuthorFilter, subreddit : string ) => { dispatch(actions.authors.changeFilter(filter, subreddit)) },
    }

}

const FilterDropdown = connect(
       mapStateToProps,
       mapDispatchToProps,
)(component);

export default FilterDropdown as any;

