exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone').nullable();
    table.date('date_of_birth').nullable();
    table.text('address').nullable();
    table.boolean('email_verified').defaultTo(false);
    table.string('email_verification_token').nullable();
    table.string('password_reset_token').nullable();
    table.timestamp('password_reset_expires').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();
    table.json('preferences').nullable();
    table.enum('subscription_tier', ['free', 'pro', 'enterprise']).defaultTo('free');
    table.timestamps(true, true);
    
    table.index('email');
    table.index('email_verification_token');
    table.index('password_reset_token');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
}; 