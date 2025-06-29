exports.up = function (knex) {
    return knex.schema.createTable('tickets', function (table) {
        table.increments('id').primary();
        table.integer('showTimeId').references('id').inTable('showTimes').onDelete('CASCADE');
        table.integer('movieId').references('id').inTable('movies').onDelete('CASCADE');
        table.integer('userId').references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('bookingTime');
        table.string('seatNumber');
        table.string('format'); // Assuming format is a string type
        table.decimal('price');
        table.timestamp('createAt').defaultTo(knex.fn.now());
        // Assuming updateAt is desired based on other tables
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('tickets');
}; 