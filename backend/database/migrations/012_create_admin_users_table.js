exports.up = function(knex) {
  return knex.schema.createTable('admin_users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('role', ['super_admin', 'admin', 'analyst']).defaultTo('analyst');
    table.json('permissions').nullable(); // Custom permissions object
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();
    table.string('password_reset_token').nullable();
    table.timestamp('password_reset_expires').nullable();
    table.string('last_login_ip', 45).nullable();
    table.timestamps(true, true);
    
    table.index('email');
    table.index('username');
    table.index('role');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('admin_users');
}; 