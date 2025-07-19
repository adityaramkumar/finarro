exports.up = function(knex) {
  return knex.schema.createTable('documents', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('filename').notNullable();
    table.string('original_filename').notNullable();
    table.string('document_type').notNullable(); // tax_return, bank_statement, receipt, etc.
    table.string('file_path').notNullable();
    table.string('file_size').notNullable();
    table.string('mime_type').notNullable();
    table.text('extracted_text').nullable();
    table.text('ai_summary').nullable();
    table.json('ai_analysis').nullable();
    table.json('metadata').nullable();
    table.boolean('is_processed').defaultTo(false);
    table.timestamp('processed_at').nullable();
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('document_type');
    table.index('is_processed');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('documents');
}; 