import * as Wetland from 'wetland';
import Subreddit from './Subreddit';
import Author from './Author';


export default class SubredditAuthor extends Wetland.Entity
{
    public last_post_date : Date;
    public hot_score : number;
    public subreddit : Subreddit;
    public author : Author;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    //These should be removed and entity properties used instead
    public author_id : number;
    public subreddit_id : number;

    static setMapping(mapping : Wetland.Mapping<SubredditAuthor>)
    {
        let options = {
            tableName: 'subreddit_authors',
        };
        mapping.entity(options);
    
        mapping.autoFields();

        mapping.field('last_post_date',
        {
            type: 'timestamp',
            nullable: false
        });

        mapping.field('hot_score',
        {
            type: 'integer',
            nullable: false,
            defaultTo: 0

        });

        mapping.manyToOne('author', { targetEntity: 'Author', inversedBy: 'in_subreddit' }).joinColumn( 'author', {onDelete: 'cascade'} );
        mapping.manyToOne('subreddit', { targetEntity: 'Subreddit', inversedBy: 'authors' }).joinColumn( 'subreddit', {onDelete: 'cascade'} );

    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }

    beforeCreate()
    {
        // Make sure the first character is upper case.
        if (!this.last_post_date)
        {
            this.last_post_date = new Date(0);
        }
    
    }
}