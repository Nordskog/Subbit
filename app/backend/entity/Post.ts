import * as Wetland from 'wetland';

import Author from './Author'
import Subreddit from './Subreddit'

export default class Post extends Wetland.Entity
{
    public title : string;
    public post_id : string;
    public score : number;
    public hot_score : number;
    public created_utc : Date;
    public num_comments : number;
    public link_flair_text : string;
    public url : string;
    public is_self : boolean;
    public selftext : string;
    public thumbnail : string;

    public author : Author;
    public subreddit : Subreddit;

    //TODO remove, use properties
    public author_id : number;
    public subreddit_id : number;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    static setMapping(mapping : Wetland.Mapping<Post>)
    {
        let options = {
            tableName: 'posts',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.field('title',
            {
                type: 'text',
                nullable: false
            });
        mapping.field('post_id',
            {
                type: 'string',
                nullable: false
            });
        mapping.field('score',
            {
                type: 'integer',
                nullable: false,
                defaultTo: 0
            });
        mapping.field('hot_score',
        {
            type: 'integer',
            nullable: false,
            defaultTo: 0

        });
        mapping.field('created_utc',
            {
                type: 'timestamp',
                nullable: false
            });


            
        mapping.field('num_comments',
        {
            type: 'integer',
            nullable: false,
            defaultTo: 0

        });
        mapping.field('link_flair_text',
        {
            type: 'text',
            nullable: true
        });

        mapping.field('url',
        {
            type: 'text',
            nullable: true
        });

        mapping.field('is_self',
        {
            type: 'boolean',
            nullable: false,
            defaultTo: true
        });

        mapping.field('selftext',
        {
            type: 'text',
            nullable: true
        });

        mapping.field('thumbnail',
        {
            type: 'text',
            nullable: true
        });

        mapping.uniqueConstraint('post_id');

        mapping.manyToOne('author', { targetEntity: 'Author', inversedBy: 'posts' }).joinColumn( 'author', {onDelete: 'cascade'} );
        mapping.manyToOne('subreddit', { targetEntity: 'Subreddit', inversedBy: 'posts' }).joinColumn( 'subreddit', {onDelete: 'cascade'} );
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }
}