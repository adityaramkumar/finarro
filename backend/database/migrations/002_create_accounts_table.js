exports.up = function(knex) {
  return knex.schema.createTable('accounts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('plaid_account_id').unique().notNullable();
    table.string('plaid_item_id').notNullable();
    table.string('institution_id').notNullable();
    table.string('institution_name').notNullable();
    table.string('account_name').notNullable();
    table.string('account_type').notNullable(); // checking, savings, credit, investment
    table.string('account_subtype').nullable();
    table.string('mask').nullable(); // last 4 digits
    table.decimal('current_balance', 15, 2).nullable();
    table.decimal('available_balance', 15, 2).nullable();
    table.string('currency', 3).defaultTo('USD');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_synced').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('plaid_account_id');
    table.index('plaid_item_id');
    table.index('institution_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('accounts');
}; 