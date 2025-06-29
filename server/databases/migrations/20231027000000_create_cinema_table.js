exports.up = function (knex) {
    return knex.schema.createTable('cinemas', function (table) {
        table.increments('id').primary();
        table.text('name');
        table.string('email', 255);
        table.string('phoneNumber', 10);
        table.text('address');
        table.text('description');
        table.dateTime('workingTime');
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('cinemas');
}; 