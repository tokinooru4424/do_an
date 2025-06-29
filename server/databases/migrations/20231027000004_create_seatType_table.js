exports.up = function (knex) {
    return knex.schema.createTable('seatTypes', function (table) {
        table.increments('id').primary();
        table.text('name');
        table.text('description');
        table.decimal('basePrice');
        // Assuming createAt and updateAt are desired based on other tables
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('seatTypes');
}; 