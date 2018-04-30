import * as React from 'react';
import { Link } from 'react-router-dom';


//import  AuthorCell from '~/client/components/author/cells/authorCell'
//import { LastVisitBar } from '~/client/components/tools/LastVisitBar'

import * as component from '~/client/components/'

import * as models from '~/common/models';

import 'css/author.scss'

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

        this.props.authors.forEach( (author) =>
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

            renders.push( <component.author.component
                key={author.author.name}
                author={author}
            /> )
        } )

        return renders;
    }

    public render()
    {
        
        return <div className="author-container">
                        {
                            this.renderAuthors()
                        }


        </div>;
        
    }


};
