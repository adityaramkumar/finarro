exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('pseudonymous_username').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('pseudonymous_username');
  });
}; 