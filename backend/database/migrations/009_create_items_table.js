exports.up = function(knex) {
  return knex.schema.createTable('items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('plaid_item_id').unique().notNullable();
    table.text('plaid_access_token').notNullable();
    table.string('institution_id').notNullable();
    table.string('institution_name').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_synced').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('plaid_item_id');
    table.index('institution_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('items');
}; 