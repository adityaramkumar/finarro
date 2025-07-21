exports.up = function(knex) {
  return knex.schema.createTable('user_actions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('action', 100).notNullable(); // 'login', 'signup', 'subscribe', 'unsubscribe', etc.
    table.json('metadata').nullable(); // Additional action-specific data
    table.timestamp('action_timestamp').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('action');
    table.index('action_timestamp');
    table.index(['user_id', 'action']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_actions');
}; 