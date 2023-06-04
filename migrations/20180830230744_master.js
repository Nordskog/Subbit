class Migration {
  static up(migration) {
    let builder = migration.getBuilder('defaultStore');

    builder.schema.createTable('auths', table => {
      table.increments('id').notNullable().primary();
      table.string('auth_type', 255).notNullable();
      table.string('access_token', 2048).notNullable();
      table.timestamp('expiry').notNullable();
      table.string('token_type', 255).notNullable();
      table.string('refresh_token', 2048).nullable();
      table.string('scope', 255).notNullable();
      table.integer('user_id').unsigned().nullable();
      table.integer('user_additional_id').unsigned().nullable();
    });

    builder.schema.createTable('authors', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('last_post_date').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.string('name', 255).notNullable();
      table.string('name_lower', 255).notNullable();
      table.unique(['name_lower'], 'authors_name_lower_unique');
    });

    builder.schema.createTable('stats_categories', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.string('category', 255).notNullable();
      table.unique(['category'], 'stats_categories_category_unique');
    });

    builder.schema.createTable('stats_entries', table => {
      table.increments('id').notNullable().primary();
      table.timestamp('end').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.float('value', 8, 2).notNullable();
      table.integer('interval_id').unsigned().nullable();
      table.integer('category_id').unsigned().nullable();
    });

    builder.schema.createTable('stats_intervals', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.integer('interval').notNullable();
      table.unique(['interval'], 'stats_intervals_interval_unique');
    });

    builder.schema.createTable('subreddits', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.string('name', 255).notNullable();
      table.string('name_lower', 255).notNullable();
      table.boolean('exists').notNullable().defaultTo('true');
      table.unique(['name_lower'], 'subreddits_name_lower_unique');
    });

    builder.schema.createTable('subscriptions', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.integer('author_id').unsigned().nullable();
      table.integer('user_id').unsigned().nullable();
    });

    builder.schema.createTable('subscriptions_subreddits', table => {
      table.increments('id').notNullable().primary();
      table.integer('subscriptions_id').unsigned().nullable();
      table.integer('subreddits_id').unsigned().nullable();
      table.index('subscriptions_id', 'idx_subscriptions_subreddits_subscriptions_id');
      table.index('subreddits_id', 'idx_subscriptions_subreddits_subreddits_id');
    });

    builder.schema.createTable('users', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.string('generation', 255).notNullable();
      table.boolean('admin_access').notNullable().defaultTo('false');
      table.boolean('stats_access').notNullable().defaultTo('false');
      table.string('username', 255).notNullable();
      table.string('username_lower', 255).notNullable();
      table.timestamp('last_visit').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.unique(['username'], 'users_username_unique');
      table.unique(['username_lower'], 'users_username_lower_unique');
    });

    builder.schema.createTable('user_settings', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.integer('user_id').unsigned().nullable();
    });

    builder.schema.alterTable('auths', table => {
      table.foreign('user_id').references('id').inTable('users').onDelete('cascade');
      table.foreign('user_additional_id').references('id').inTable('users').onDelete('cascade');
    });

    builder.schema.alterTable('stats_entries', table => {
      table.foreign('interval_id').references('id').inTable('stats_intervals').onDelete('cascade');
      table.foreign('category_id').references('id').inTable('stats_categories').onDelete('cascade');
    });

    builder.schema.alterTable('subscriptions', table => {
      table.foreign('author_id').references('id').inTable('authors').onDelete('cascade');
      table.foreign('user_id').references('id').inTable('users').onDelete('cascade');
    });

    builder.schema.alterTable('subscriptions_subreddits', table => {
      table.foreign(['subreddits_id']).references('id').inTable('subreddits').onDelete('cascade');
      table.foreign(['subscriptions_id']).references('id').inTable('subscriptions').onDelete('cascade');
    });

    builder.schema.alterTable('user_settings', table => {
      table.foreign('user_id').references('id').inTable('users').onDelete('cascade');
    });
    
    ///////////////////////
    // Manually edited 
    ///////////////////////
    
    //User settings
        builder.schema.alterTable('user_settings', table => {
      table.unique(['user_id'], 'user_settings_unique_user');
    });
    
    //Subscription
    builder.schema.alterTable('subscriptions', table => {
      table.unique(['user_id', 'author_id'], 'subscriptions_unique_user_author');
    });
    
    builder.schema.alterTable('subscriptions_subreddits', table => {
      table.unique(['subscriptions_id', 'subreddits_id'], 'subscriptions_unique_subscription_subreddit');
    });
    
    //Auths
    builder.schema.alterTable('auths', table => {
      table.unique(['user_id'], 'auth_unique_user');
      table.unique(['user_additional_id'], 'auth_unique_user_additional');
    });
    
  }

  static down(migration) {
    let builder = migration.getBuilder('defaultStore');

    builder.schema.alterTable('auths', table => {
      table.dropForeign('user_id');
      table.dropForeign('user_additional_id');
    });

    builder.schema.alterTable('stats_entries', table => {
      table.dropForeign('interval_id');
      table.dropForeign('category_id');
    });

    builder.schema.alterTable('subscriptions', table => {
      table.dropForeign('author_id');
      table.dropForeign('user_id');
    });

    builder.schema.alterTable('user_settings', table => {
      table.dropForeign('user_id');
    });

    builder.schema.dropTable('auths');

    builder.schema.dropTable('authors');

    builder.schema.dropTable('stats_categories');

    builder.schema.dropTable('stats_entries');

    builder.schema.dropTable('stats_intervals');

    builder.schema.dropTable('subreddits');

    builder.schema.dropTable('subscriptions');

    builder.schema.dropTable('users');

    builder.schema.dropTable('user_settings');

    builder.schema.dropTable('subscriptions_subreddits');
  }
}

module.exports.Migration = Migration;
