import * as Wetland from 'wetland';
import Author from './Author'
import User from './User'
import Subreddit from './Subreddit'
import * as models from '~/common/models'


export default class Subscription extends Wetland.Entity
{
    public author : Author;
    public user : User;
    public subreddits : Wetland.ArrayCollection<Subreddit>;

    public id : number;
    public createdAt : Date;
    public updatedAt : Date;

    //These should be removed and entity properties used
    public author_id : number;
    public user_id : number;

    static setMapping(mapping : Wetland.Mapping<Subscription>)
    {
        let options = {
            tableName: 'subscriptions',
        };
        mapping.entity(options);

        mapping.autoFields();

        mapping.manyToOne('author', { targetEntity: 'Author', inversedBy: 'subscriptions' }).joinColumn( 'author', {onDelete: 'cascade'} );
        mapping.manyToOne('user', { targetEntity: 'User', inversedBy: 'subscriptions' }).joinColumn( 'user', {onDelete: 'cascade'} );

        mapping.manyToMany('subreddits', { targetEntity: 'Subreddit', inversedBy: 'subscriptions' });
    }

    beforeUpdate(updatedValues, EntityManager : Wetland.EntityManager)
    {
        this.updatedAt = new Date();
    }

    static formatModel(sub : Subscription) : models.data.Subscription
    {
        if (sub == null)
        {
            return null;
        }

        return {
            id: sub.id,
            user : sub.user.username,
            author: sub.author.name,
            subscribed: true,   //If it exists on the server then we're subscribed
            subreddits : sub.subreddits.map( ( subred : Subreddit ) => 
            {
                return {
                    id: subred.id, 
                    name: subred.name,
                    subscribed: true
                }
            } )
        } as models.data.Subscription
    }
}