exports.up = function (knex) {
    return knex.schema.createTable('faqs', function (table) {
        table.text('question');
        table.text('answer');
        table.string('category', 50);
        table.dateTime('createAt'); // Using dateTime as per schema
        // Assuming updateAt is desired based on other tables, though not in schema for this table
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('faqs');
}; 