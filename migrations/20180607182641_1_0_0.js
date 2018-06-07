class Migration {
  static up(migration) {
    let builder = migration.getBuilder('defaultStore');

    builder.schema.createTable('auths', table => {
      table.increments('id').notNullable().primary();
      table.string('auth_type', 255).notNullable();
      table.string('access_token', 255).notNullable();
      table.timestamp('expiry').notNullable();
      table.string('token_type', 255).notNullable();
      table.string('refresh_token', 255).nullable();
      table.string('scope', 255).notNullable();
      table.integer('user_id').unsigned().nullable();
    });

    builder.schema.createTable('authors', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('last_post_date').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.string('name', 255).notNullable();
      table.string('name_lower', 255).notNullable();
      table.unique(['name_lower'], 'authors_name_unique');
    });

    builder.schema.createTable('subreddits', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.string('name', 255).notNullable();
      table.string('name_lower', 255).notNullable().defaultTo('null');
      table.unique(['name_lower'], 'subreddits_name_unique');
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
      table.string('username', 255).notNullable();
      table.timestamp('last_visit').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.unique(['username'], 'username_unique');
    });

    builder.schema.createTable('user_settings', table => {
      table.increments('id').notNullable().primary();
      table.datetime('createdAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.datetime('updatedAt').notNullable().defaultTo(builder.knex.raw('CURRENT_TIMESTAMP'));
      table.enu('post_display_mode', ['minimal','compact','full']).notNullable().defaultTo('compact');
      table.integer('user_id').unsigned().nullable();
    });

    builder.schema.alterTable('auths', table => {
      table.foreign('user_id').references('id').inTable('users').onDelete('cascade');
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
    });
    
    
  }

  static down(migration) {
    let builder = migration.getBuilder('defaultStore');

    builder.schema.alterTable('auths', table => {
      table.dropForeign('user_id');
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

    builder.schema.dropTable('subreddits');

    builder.schema.dropTable('subscriptions');

    builder.schema.dropTable('users');

    builder.schema.dropTable('user_settings');

    builder.schema.dropTable('subscriptions_subreddits');
  }
}

module.exports.Migration = Migration;
