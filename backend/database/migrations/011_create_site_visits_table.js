exports.up = function(knex) {
  return knex.schema.createTable('site_visits', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('ip_address', 45).notNullable(); // Supports both IPv4 and IPv6
    table.string('country', 100).nullable();
    table.string('region', 100).nullable();
    table.string('city', 100).nullable();
    table.string('timezone', 100).nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.text('user_agent').nullable();
    table.string('browser', 100).nullable();
    table.string('operating_system', 100).nullable();
    table.string('device_type', 50).nullable(); // desktop, mobile, tablet
    table.string('page_path').notNullable();
    table.string('referrer', 2048).nullable();
    table.string('utm_source', 255).nullable();
    table.string('utm_medium', 255).nullable();
    table.string('utm_campaign', 255).nullable();
    table.integer('session_duration').nullable(); // in seconds
    table.boolean('is_new_visitor').defaultTo(true);
    table.string('session_id', 36).nullable();
    table.timestamp('visit_timestamp').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('ip_address');
    table.index('visit_timestamp');
    table.index('page_path');
    table.index('session_id');
    table.index(['country', 'region']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('site_visits');
}; 