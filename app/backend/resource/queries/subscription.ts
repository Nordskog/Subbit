import * as Knex from 'knex';

const subscriptionQueryStatement : string = `
select 
(
    select json_build_object
    (
        'id', sub.id,
        'author', author.name,
        'user', u.username,
        'subreddits',  (select COALESCE( json_agg(json_build_object
            (
                'id', inSubreddit.subreddit_id,
                'name', subreddit.name,
                'subscribed', CASE WHEN subbedReddits.subreddits_id IS null THEN false ELSE true END
            ) ), '[]' )	
            from subreddit_authors inSubreddit
                left join subscriptions_subreddits subbedReddits on sub.id = subbedReddits.subscriptions_id and inSubreddit.subreddit_id = subbedReddits.subreddits_id
                right join subreddits subreddit on inSubreddit.subreddit_id=subreddit.id
                where inSubreddit.author_id=sub.author_id
            )
    )
    from subscriptions sub
    right join users u on u.id = sub.user_id
    right join authors author on author.id=sub.author_id
    where sub.id=:subscription limit 1
)
as json
`

export function getSubscription(knexRaw: Knex, subscriptionId : number)
{
    return knexRaw.raw(subscriptionQueryStatement, {
        subscription: subscriptionId

    });
}