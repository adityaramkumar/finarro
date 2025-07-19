exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('stripe_customer_id').unique().notNullable();
    table.string('stripe_subscription_id').unique().nullable();
    table.string('stripe_price_id').nullable();
    table.enum('status', ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']).nullable();
    table.timestamp('current_period_start').nullable();
    table.timestamp('current_period_end').nullable();
    table.timestamp('canceled_at').nullable();
    table.timestamp('trial_start').nullable();
    table.timestamp('trial_end').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('stripe_customer_id');
    table.index('stripe_subscription_id');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
}; 