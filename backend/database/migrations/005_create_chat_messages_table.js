exports.up = function(knex) {
  return knex.schema.createTable('chat_messages', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('conversation_id').notNullable();
    table.enum('role', ['user', 'assistant']).notNullable();
    table.text('content').notNullable();
    table.json('context_data').nullable(); // financial data context used for AI response
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('conversation_id');
    table.index('role');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('chat_messages');
}; 