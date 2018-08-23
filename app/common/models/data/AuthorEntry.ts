import Author from './Author';
import Subscription from './Subscription';

export default interface AuthorEntry
{
    author: Author;
    subscription: Subscription;    
    after : string; // For looking up more posts on reddit
    end : boolean;  // If there are any more posts
}
