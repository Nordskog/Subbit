import Subscription from './Subscription';
import { Post } from '~/common/models/reddit';

export default interface Author
{
    id: number;
    name: string;
    last_post_date: number;
    post_count: number;
    posts: Post[];
}
