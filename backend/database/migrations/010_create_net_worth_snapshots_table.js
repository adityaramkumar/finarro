exports.up = function(knex) {
  return knex.schema.createTable('net_worth_snapshots', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.date('snapshot_date').notNullable();
    table.decimal('total_assets', 15, 2).notNullable();
    table.decimal('total_liabilities', 15, 2).notNullable();
    table.decimal('net_worth', 15, 2).notNullable();
    table.json('account_breakdown').nullable(); // Store detailed breakdown
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('snapshot_date');
    table.unique(['user_id', 'snapshot_date']); // One snapshot per user per day
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('net_worth_snapshots');
}; 