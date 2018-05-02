import * as models from '~/common/models'
import * as actions from '~/client/actions'

//Call getPostInfo with input once queue is full, so we don't waste any requests
let queue : models.data.AuthorEntry[] = [];
let postCount : number = 0;

export function addAuthorEntryToQueue( author : models.data.AuthorEntry, dispatch )
{
    queue.push(author);
    postCount = postCount + author.author.posts.length;

    console.log("Post info queue length:",postCount);

    if (postCount > 25)
        processNow(dispatch);
}

export function addAuthorToQueue( author : string, posts : models.reddit.Post[], dispatch )
{
    let dummyEntry : models.data.AuthorEntry = {
        author : 
        {
            name: author,
            id: -1,
            last_post_date: 0,
            post_count: 0,
            posts: posts,
            subscriptions: null
        },
        subscription: null,
        after: null,
        end: null
    }

    addAuthorEntryToQueue(dummyEntry, dispatch);
}



export function processNow( dispatch )
{
    console.log("Getting post info");
    postCount = 0;
    dispatch( actions.authors.getPostInfoAction(queue, 0) );
    queue = [];
}