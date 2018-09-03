import Author from './Author';
import Subscription from './Subscription';

export interface AuthorEntry
{
    author: Author;
    subscription: Subscription;    
    after : string; // For looking up more posts on reddit
    end : boolean;  // If there are any more posts
}

export namespace AuthorEntry 
{
    export function getNew( name ) : AuthorEntry
    {
        return { 
                author: {
                    id : -1,
                    name: name,
                    last_post_date: 0,
                    post_count : 0,
                    posts: []
                },
                subscription: null,
                after: null,
                end: false
        };
    
    }

}
