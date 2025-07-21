exports.up = function(knex) {
  return knex.schema.createTable('business_metrics', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('metric_date').notNullable();
    table.enum('period_type', ['daily', 'weekly', 'monthly']).notNullable();
    
    // User metrics
    table.integer('total_users').defaultTo(0);
    table.integer('new_users').defaultTo(0);
    table.integer('active_users').defaultTo(0);
    table.integer('paid_users').defaultTo(0);
    table.integer('free_users').defaultTo(0);
    table.integer('pro_users').defaultTo(0);
    table.integer('enterprise_users').defaultTo(0);
    
    // Visit metrics
    table.integer('total_visits').defaultTo(0);
    table.integer('unique_visitors').defaultTo(0);
    table.integer('returning_visitors').defaultTo(0);
    table.decimal('avg_session_duration', 8, 2).defaultTo(0);
    table.integer('page_views').defaultTo(0);
    table.decimal('bounce_rate', 5, 2).defaultTo(0);
    
    // Financial metrics
    table.decimal('total_revenue', 12, 2).defaultTo(0);
    table.decimal('monthly_recurring_revenue', 12, 2).defaultTo(0);
    table.decimal('avg_revenue_per_user', 8, 2).defaultTo(0);
    table.integer('new_subscriptions').defaultTo(0);
    table.integer('cancelled_subscriptions').defaultTo(0);
    table.decimal('churn_rate', 5, 2).defaultTo(0);
    
    // Engagement metrics
    table.integer('plaid_connections').defaultTo(0);
    table.integer('documents_uploaded').defaultTo(0);
    table.integer('ai_chat_sessions').defaultTo(0);
    table.integer('shared_charts').defaultTo(0);
    
    // Geographic breakdown (JSON for top countries/regions)
    table.json('geographic_breakdown').nullable();
    table.json('device_breakdown').nullable();
    table.json('traffic_sources').nullable();
    
    table.timestamps(true, true);
    
    table.unique(['metric_date', 'period_type']);
    table.index('metric_date');
    table.index('period_type');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('business_metrics');
}; 