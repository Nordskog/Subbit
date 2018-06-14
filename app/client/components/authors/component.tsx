import * as React from 'react';



//import  AuthorCell from '~/client/components/author/cells/authorCell'
//import { LastVisitBar } from '~/client/components/tools/LastVisitBar'

import * as component from '~/client/components/'

import * as models from '~/common/models';

import * as styles from 'css/author.scss';

import * as transitions from 'react-transition-group'
import { AuthorFilter } from '~/common/models';
import { AuthorEntry } from '~/common/models/data';

interface Props 
{
    authors: models.data.AuthorEntry[];
    filter: string;
    lastVisit: number;

}



export default class AuthorsComponent extends React.Component<Props, {} >
{
    shouldRenderLastVisitBar()
    {
        let shouldRender = ( this.props.filter == AuthorFilter.NEW || this.props.filter == AuthorFilter.SUBSCRIPTIONS) && this.props.authors.length > 0;
        if (shouldRender)
        {
            let topAuthor : AuthorEntry = this.props.authors[0];
            if (topAuthor.author.last_post_date < this.props.lastVisit )
                return false;
        }

        return shouldRender;
    }

    renderAuthors()
    {
        let renders = new Array(this.props.authors.length);

        //list visited only works when sorting by new, so NEW or SUBSCRIPTIONS
        let lastVisitAdded : boolean = !this.shouldRenderLastVisitBar();

        this.props.authors.forEach( (author, index) =>
        {
            if (!lastVisitAdded)
            {
                if (author.author.last_post_date < this.props.lastVisit)
                {
                    renders.push( <component.tools.lastVisitBar
                        key={"Last visit bar"}
                        lastVisit={this.props.lastVisit}
                    /> )

                    lastVisitAdded = true;
                }
            }


            renders.push( 
            
                
            <component.transitions.Fade key={author.author.name} >
                <component.author.component author={author} />
            </component.transitions.Fade>
                
         
             );
        } )

        return renders;
    }

    public render()
    {
        
        return <transitions.TransitionGroup component={'div'} className={styles.container}>
                { this.renderAuthors()}
                </transitions.TransitionGroup>;
        
    }


};
