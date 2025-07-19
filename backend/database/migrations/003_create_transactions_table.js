exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('account_id').references('id').inTable('accounts').onDelete('CASCADE');
    table.string('plaid_transaction_id').unique().notNullable();
    table.string('name').notNullable();
    table.text('description').nullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.date('date').notNullable();
    table.date('authorized_date').nullable();
    table.string('category_primary').nullable();
    table.json('category_detailed').nullable();
    table.string('merchant_name').nullable();
    table.string('payment_channel').nullable(); // online, in store, etc.
    table.string('payment_method').nullable(); // card, ach, etc.
    table.boolean('pending').defaultTo(false);
    table.string('location_address').nullable();
    table.string('location_city').nullable();
    table.string('location_region').nullable();
    table.string('location_postal_code').nullable();
    table.string('location_country').nullable();
    table.decimal('location_lat', 10, 8).nullable();
    table.decimal('location_lon', 11, 8).nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('account_id');
    table.index('plaid_transaction_id');
    table.index('date');
    table.index('category_primary');
    table.index('merchant_name');
    table.index('amount');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
}; 