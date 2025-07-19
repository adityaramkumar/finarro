exports.up = function(knex) {
  return knex.schema.createTable('shared_charts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('share_token').unique().notNullable(); // URL-safe unique identifier
    table.string('chart_type').notNullable().defaultTo('net_worth'); // future: other chart types
    table.text('title').nullable(); // optional custom title
    table.json('chart_data').notNullable(); // anonymized chart data
    table.json('settings').nullable(); // display settings like timeframe, colors
    table.boolean('is_active').defaultTo(true);
    table.timestamp('expires_at').nullable(); // optional expiration
    table.integer('view_count').defaultTo(0);
    table.timestamps(true, true);
    
    table.index('share_token');
    table.index('user_id');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('shared_charts');
}; 