
import * as Knex from 'knex';
import * as tools from '~/common/tools'

///////////////////////////
// Reusable components
///////////////////////////

const commonSubscription = `
'subscription',
CASE
    WHEN :get_user_subscription THEN
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
        where sub.author_id=author.id and sub.user_id=:subscription_for_user_id limit 1
    )
    ELSE 'null'
END
`;

const commonSubscriptions = `
'subscriptions', 
    select COALESCE( json_agg(json_build_object
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
    )), '[]' )
        from subscriptions sub
        right join users u on u.id = sub.user_id
        where sub.author_id=author.id
    )
`;

function populateAuthor(postsQuery : string, getSubscriptions : boolean)
{
    return `
    'author', json_build_object
    (
        'id', id,
        'name', name,
        'last_post_date', extract( epoch from author.last_post_date),
        'posts', 
        ( 
            select COALESCE( json_agg(json_build_object
            (
                'title', post.title,
                'post_id', post.post_id,
                'score', post.score,
                'created_utc', extract( epoch from post.created_utc),
                'subreddit', post.subreddit_name
            ) ), '[]' )
            from
            (
                select post.title, post.post_id, post.score, post.created_utc, subreddit.name as subreddit_name
                ${postsQuery} 
                order by post.created_utc DESC limit 25
            ) as post
        ),
        'post_count', 
        ( 
            select count(post.id) 
            ${postsQuery}
        )
        ${getSubscriptions ? ',' + commonSubscriptions : ''}
    )
    `
}

//////////////////////////////////////////
// Multiples (authors or subscriptions)
//////////////////////////////////////////

//Gets all authors, no filters
//subscription_for_user_id: 		    Subscription for each author populated by this user
//get_user_subscription: 		        ^ gets subscription if true
//resultsPerPage: 			            Number of results per page,
//pageNumber:		 	                Page offset, starting from 0
function authorsQueryStatement( getSubscriptions : boolean, orderByHotScore : boolean)
{ 
    return `
        select (
            select COALESCE( json_agg( json_build_object
            (
                ${populateAuthor(
                    `from posts post 
                    left join subreddits subreddit on post.subreddit_id = subreddit.id
                    where author.id=post.author_id`
                , getSubscriptions)},
                ${commonSubscription}
            ) ), '[]')
            from (
                select 	authors.name, authors.id, 
                        coalesce( max(inSubreddit.last_post_date), to_timestamp(0) )  as last_post_date, 
                        coalesce( max(inSubreddit.hot_score), 0 )  as hot_score
                from authors
                left join subreddit_authors inSubreddit on authors.id = inSubreddit.author_id
                group by authors.id
                order by ${orderByHotScore ? 'hot_score' : 'last_post_date'} 
                DESC limit :resultsPerPage offset :pageNumber
            ) as author
        ) as json
`
}

//Gets all authors, filter by subreddit, optionally only subscribed
//authors_subscribed_to_by_user_id:     optional: Get authors subscribed to by this user
//subscription_for_user_id: 		    Subscription for each author populated by this user
//get_user_subscription: 		        ^ gets subscription if true
//resultsPerPage: 			            Number of results per page,
//pageNumber:		 	                Page offset, starting from 0
//subreddit:                            name of subreddit
function authorsInSubredditQueryStatement(getSubscriptions : boolean, getSubscribed : boolean, orderByHotScore : boolean)
{ 
    return `
        select (
            select COALESCE( json_agg( json_build_object
            (
                ${populateAuthor(
                    `
                    from posts post 
					right join subreddits subreddit on subreddit.id = post.subreddit_id
					where post.subreddit_id = author.subreddit_id and post.author_id = author.id
                    `
                , getSubscriptions)},
                ${commonSubscription}
            ) ), '[]')
            from (
                select inSubreddit.last_post_date as last_post_date, 
                inSubreddit.hot_score as hot_score,
                authors.id, authors.name, subreddit.id as subreddit_id	
				from subreddits subreddit 	
                left join subreddit_authors inSubreddit on inSubreddit.subreddit_id = subreddit.id 	
                ${getSubscribed ? `inner join subscriptions sub on sub.user_id=:authors_subscribed_to_by_user_id and sub.author_id = inSubreddit.author_id` : ''}																																												
                right join authors on authors.id = inSubreddit.author_id
                where subreddit.name_lower = :subreddit
                order by ${orderByHotScore ? 'hot_score' : 'last_post_date'} DESC limit :resultsPerPage offset :pageNumber
                 )
            as author
        ) as json
`
}

//Gets subscriptions for user
//Authors and posts filtered by subscribed subreddits
//
//subscription_for_user_id: 		    Subscription for each author populated by this user
//get_user_subscription: 		        ^ gets subscription if true
//authors_subscribed_to_by_user_id: 	List authors subscribed to by this user,
//resultsPerPage: 			            Number of results per page,
//pageNumber:		 	                Page offset, starting from 0	
function subscribedAuthorsQuery(getSubscriptions : boolean)
{ 
    return `
        select (
            select COALESCE( json_agg( json_build_object
            (
                ${populateAuthor(
                    `
                    from posts post 																							
                    right join subscriptions_subreddits subbed_reddits on author.subscription_id = subbed_reddits.subscriptions_id and post.subreddit_id=subbed_reddits.subreddits_id
                    left join subreddits subreddit on post.subreddit_id = subreddit.id																											
                    where author.id=post.author_id
                    `
                , getSubscriptions)},
                ${commonSubscription}
            ) ), '[]')
            from ( 	
                select author.name, 
                        inSubreddit.author_id as id, 
                        subscription.id as subscription_id,
                        max(inSubreddit.last_post_date) as last_post_date from subscriptions as subscription
                    left join subreddit_authors inSubreddit on subscription.author_id = inSubreddit.author_id
                    inner join subscriptions_subreddits subbedReddit on subbedReddit.subscriptions_id=subscription.id and inSubreddit.subreddit_id=subbedReddit.subreddits_id
                    right join authors author on author.id = subscription.author_id
                    where subscription.user_id=:authors_subscribed_to_by_user_id
                    group by inSubreddit.author_id, author.name, subscription.id
                    order by last_post_date DESC limit :resultsPerPage offset :pageNumber
                 ) 
            as author 
        ) as json
`
}


////////////////////////////////////
//Singles (author or subscription)
////////////////////////////////////



//Single author, posts filterable by subreddit
//
//subscription_for_user_id: 		    Subscription for each author populated by this user
//get_user_subscription: 		        ^ gets subscription if true
//subreddit:                            Optional: Limit posts to those from this subreddit
//author:                               name of author
function singleAuthorQuery(getSubscriptions : boolean, filterSubreddit : boolean)
{ 
    return `
        select (
            select COALESCE( json_agg( json_build_object
            (
                ${populateAuthor(
                    `
                    from posts post 
                    right join subreddits subreddit on subreddit.id = post.subreddit_id
                    where post.author_id = author.id${ filterSubreddit ?  ` and subreddit.name_lower=:subreddit` : ' '}
                    `
                , getSubscriptions)},
                ${commonSubscription}
            ) ), '[]') 
            from ( 	
                        select author.name, 
                        author.id as id, 
                        coalesce( max(inSubreddit.last_post_date), to_timestamp(0) )  as last_post_date, 
                        coalesce( max(inSubreddit.hot_score), 0 )  as hot_score
                        from authors author 
                        left join subreddit_authors inSubreddit on author.id = inSubreddit.author_id
                        where author.name_lower=LOWER(:author)
                        group by author.id
                        limit 1
                 ) 
            as author 
        ) as json
`
}

//Single author, posts filtered by subscribed subreddits
//
//subscription_for_user_id: 		    Subscription for each author populated by this user
//get_user_subscription: 		        ^ gets subscription if true
//subscription:                         ID of target subscription
function singleSubscriptionQuery(getSubscriptions : boolean, includeAllPosts : boolean)
{ 
    return `
        select (
            select COALESCE( json_agg( json_build_object
            (
                ${populateAuthor(
                    `
                    from posts post 
					right join subreddits subreddit on subreddit.id = post.subreddit_id
					${ includeAllPosts ? ' ' : `inner join subscriptions_subreddits subs on subs.subscriptions_id=sub_id and post.subreddit_id=subs.subreddits_id`}
                    where post.author_id = author.id
                    `
                , getSubscriptions)},
                'subscription',
                (
                    select json_build_object
                    (
                        'id', sub_id,
                        'author', author.name,
                        'user', user_username,
                        'subreddits',  (select COALESCE( json_agg(json_build_object
                            (
                                'id', inSubreddit.subreddit_id,
                                'name', subreddit.name,
                                'subscribed', CASE WHEN subbedReddits.subreddits_id IS null THEN false ELSE true END
                            ) ), '[]' )	
                            from subreddit_authors inSubreddit
                                left join subscriptions_subreddits subbedReddits on sub_id= subbedReddits.subscriptions_id and inSubreddit.subreddit_id = subbedReddits.subreddits_id
                                right join subreddits subreddit on inSubreddit.subreddit_id=subreddit.id
                                where inSubreddit.author_id=author.id
                            )
                    )
                )
            ) ), '[]')
            from ( 	
                    select author.name,
                        author.id,
                        author.last_post_date,
                        sub.user_id as user_id,
                        sub.id as sub_id,
                        u.username as user_username																			
                        from subscriptions sub
                        left join authors author on sub.author_id=author.id
                        left join users u on u.id = sub.user_id
                    where sub.id=:subscription
                 ) 
            as author 
        ) as json
`
}

function updateSubredditAuthorHotScoreStatement( daysFromNow? : number, subreddit_id? : number, until? : Date )
{
    return `
    WITH reference AS 
    (
        select max(posts.hot_score) as hot_score, posts.author_id, posts.subreddit_id
        from posts
        left join subreddit_authors on subreddit_authors.subreddit_id = posts.subreddit_id and subreddit_authors.author_id = posts.author_id
        ${ tools.query.concatConditionals( 'where', 'and',  
            subreddit_id != null ? 'posts.subreddit_id = :subreddit_id' : null ,
            daysFromNow != null ? `created_utc > (now()::timestamp - (:daysFromNow * interval '1 day')  )` : null,
            until != null ? `created_utc > :until` : null
        )}
        group by posts.subreddit_id, posts.author_id
    )
    update subreddit_authors auth
    set hot_score = r.hot_Score
    from reference r
    where r.author_id = auth.author_id and r.subreddit_id = auth.subreddit_id
    `
}

//TODO
function pruneAuthorsWithNoPostsStatement( )
{
    return `
    select * from authors author
    left join posts post on post.author_id = author.id
    where post is null
    `;
}

export function pruneAuthorsWithNoPosts(knexRaw: Knex)
{
    return knexRaw.raw(pruneAuthorsWithNoPostsStatement(), {
    });
}

export function updateSubredditAuthorHotScore(knexRaw: Knex, daysFromNow? : number, subreddit_id? : number, until? : Date )
{
    return knexRaw.raw(updateSubredditAuthorHotScoreStatement(daysFromNow, subreddit_id, until), {
        daysFromNow: String( Math.round(daysFromNow) ),
        subreddit_id: subreddit_id,
        until: until
    });
}

export function getAuthors(knexRaw: Knex, populateSubscriptionForUserId: number, listAuthorSubscriptions : boolean, orderByHotScore : boolean, resultsPerPage : number, pageNumber : number)
{
    let getUserSubscription: boolean = populateSubscriptionForUserId != undefined && populateSubscriptionForUserId != null && populateSubscriptionForUserId != 0;

    //Offset
    pageNumber = pageNumber * resultsPerPage;

    return knexRaw.raw(authorsQueryStatement(   listAuthorSubscriptions, 
                                                orderByHotScore), 
    {
        subscription_for_user_id: populateSubscriptionForUserId,
        get_user_subscription: getUserSubscription,
        resultsPerPage: resultsPerPage,
        pageNumber: pageNumber
    });
}

export function getAuthorsInSubreddit(  knexRaw: Knex, 
                                        subreddit : string, 
                                        authorsSubscribedToByUserId : number, 
                                        populateSubscriptionForUserId: number, 
                                        listAuthorSubscriptions : boolean,
                                        orderByHotScore : boolean,
                                        resultsPerPage : number,
                                        pageNumber : number)
{
    let getUserSubscription: boolean = populateSubscriptionForUserId != undefined && populateSubscriptionForUserId != null && populateSubscriptionForUserId != 0;

    //Offset
    pageNumber = pageNumber * resultsPerPage;

    return knexRaw.raw(authorsInSubredditQueryStatement (listAuthorSubscriptions,
                                                        (authorsSubscribedToByUserId != 0 && authorsSubscribedToByUserId != null),
                                                         orderByHotScore), 
    {
        subscription_for_user_id: populateSubscriptionForUserId,
        get_user_subscription: getUserSubscription,
        resultsPerPage: resultsPerPage,
        pageNumber: pageNumber,
        subreddit: subreddit.toLowerCase(),
        authors_subscribed_to_by_user_id: authorsSubscribedToByUserId
    });
}

export function getSubscribedAuthors(knexRaw: Knex, authorsSubscribedToByUserId : number, populateSubscriptionForUserId: number, listAuthorSubscriptions: boolean,  resultsPerPage : number, pageNumber : number)
{
    let getUserSubscription: boolean = populateSubscriptionForUserId != undefined && populateSubscriptionForUserId != null && populateSubscriptionForUserId != 0;
    pageNumber = pageNumber * resultsPerPage;

    return knexRaw.raw(subscribedAuthorsQuery(listAuthorSubscriptions), {
        subscription_for_user_id: populateSubscriptionForUserId,
        get_user_subscription: getUserSubscription,
        authors_subscribed_to_by_user_id: authorsSubscribedToByUserId,
        resultsPerPage: resultsPerPage,
        pageNumber: pageNumber
    });
}

export function getSubscription(knexRaw: Knex, subscriptionId : number, includeAllPosts : boolean, listAuthorSubscriptions: boolean)
{
    return knexRaw.raw(singleSubscriptionQuery(listAuthorSubscriptions, includeAllPosts), {
        subscription: subscriptionId

    });
}

export function getAuthor(knexRaw: Knex, author : string, subreddit : string, populateSubscriptionForUserId : number, listAuthorSubscriptions: boolean = false)
{
    let getUserSubscription: boolean = populateSubscriptionForUserId != undefined && populateSubscriptionForUserId != null && populateSubscriptionForUserId != 0;

    return knexRaw.raw(singleAuthorQuery(listAuthorSubscriptions, (subreddit != null)), {
        author: author,
        subreddit: subreddit != null ? subreddit.toLowerCase() : null,
        subscription_for_user_id: populateSubscriptionForUserId,
        get_user_subscription: getUserSubscription
    });
}