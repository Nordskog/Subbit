import * as React from 'react';



//import  AuthorCell from '~/client/components/author/cells/authorCell'
//import { LastVisitBar } from '~/client/components/tools/LastVisitBar'

import * as component from '~/client/components/'

import * as models from '~/common/models';

import * as styles from 'css/author.scss';

import * as transitions from 'react-transition-group'

interface Props 
{
    authors: models.data.AuthorEntry[];
    filter: string;
    lastVisit: number;

}

export default class AuthorsComponent extends React.Component<Props, {} >
{
    renderAuthors()
    {
        let renders = new Array(this.props.authors.length);

        let lastVisitAdded : boolean = false;
        if (this.props.authors.length > 0 && this.props.authors[0].author.last_post_date < this.props.lastVisit )
        {
            //Skip if it would end up at the top of the screen
            lastVisitAdded = true;
        }

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
