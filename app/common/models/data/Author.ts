import Post from './Post'
import Subscription from './Subscription'

export default interface Author
{
    id: number;
    name: string;
    last_post_date: number;
    post_count: number;
    posts: Post[];
    subscriptions: Subscription[];
}