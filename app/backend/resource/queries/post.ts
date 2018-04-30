import * as Knex from 'knex';
import * as tools from '~/common/tools'

const commonPost = 
    `
        select COALESCE( json_agg(json_build_object
            (
                'title', post.title,
                'post_id', post.post_id,
                'score', post.score,
                'created_utc', extract( epoch from post.created_utc),
                'subreddit', post.subreddit_name
            ) ), '[]' )
    `

function postsForAuthorStatement()
{
    return `
    select (
        ${commonPost}
        from
        (
            select post.title, post.post_id, post.score, post.created_utc, subreddit.name as subreddit_name
            from posts post 																							
            left join subreddits subreddit on post.subreddit_id = subreddit.id																											
            where :authorId = post.author_id
            order by post.created_utc DESC limit :count offset :offset
        ) as post
    ) as json
    `
}

function postsForSubscribedAuthorStatement()
{
    return `
    select (
        ${commonPost}
        from
        (
            select post.title, post.post_id, post.score, post.created_utc, subreddit.name as subreddit_name	
            from subscriptions sub
            left join subscriptions_subreddits subs on sub.id = subs.subscriptions_id																																																		
            left join posts post on post.subreddit_id = subs.subreddits_id and post.author_id = :authorId
            left join subreddits subreddit on post.subreddit_id = subreddit.id
            where sub.user_id = :userId
            group by post.id, subreddit.name
            order by post.created_utc DESC limit :count
            offset :offset
        ) as post
    ) as json
    `
}

function postsForUserInSubredditStatement()
{
    return `
        select (
        ${commonPost}
        from
        (
            select post.title, post.post_id, post.score, post.created_utc, subreddit.name as subreddit_name	
            from subreddits subreddit																																																	
            left join posts post on post.subreddit_id = subreddit.id and post.author_id = :authorId
            where subreddit.name_lower = :subredditName
            group by post.id, subreddit.name
            order by post.created_utc DESC limit 25
            offset :offset
        ) as post
    ) as json
    `
}

function updateHotScoreStatement( daysFromNow? : number, subreddit_id? : number, until? : Date  ) : string
{
    
 return `
    update posts 
    set hot_score = calculate_hot_score(score, extract( epoch from created_utc)::real, extract(epoch from now() )::real )
    ${ tools.query.concatConditionals( 'where', 'and',  
        subreddit_id != null ? 'posts.subreddit_id = :subreddit_id' : null ,
        daysFromNow != null ? `created_utc > (now()::timestamp - (:daysFromNow * interval '1 day')  )` : null,
        until != null ? `created_utc > :until` : null
    )}
    `;
    
}

export function updateHotScore(knexRaw: Knex, daysFromNow? : number, subreddit_id? : number, until? : Date )
{
    return knexRaw.raw(updateHotScoreStatement(daysFromNow, subreddit_id, until), {
        daysFromNow: daysFromNow,
        subreddit_id: subreddit_id,
        until: until
    });
}


export function getPostsForAuthor(knexRaw: Knex, authorId : number, count : number, offset : number)
{
    return knexRaw.raw(postsForAuthorStatement(), {
        authorId: authorId,
        count: count,
        offset: offset
    });
}

export function getPostsForSubscribedAuthor(knexRaw: Knex, authorId : number, userId : number, count : number, offset : number)
{
    return knexRaw.raw(postsForSubscribedAuthorStatement(), {
        authorId: authorId,
        userId: userId,
        count: count,
        offset: offset

    });
}

export function getPostsForAuthorInSubreddit(knexRaw: Knex, authorId : number, subredditName : string, count : number, offset : number)
{
    return knexRaw.raw(postsForUserInSubredditStatement(), {
        authorId: authorId,
        subredditName: subredditName.toLowerCase(),
        count: count,
        offset: offset
    });
}