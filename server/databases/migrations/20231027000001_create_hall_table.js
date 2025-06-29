exports.up = function (knex) {
    return knex.schema.createTable('halls', function (table) {
        table.increments('id').primary();
        table.integer('cinemaId').references('id').inTable('cinemas').onDelete('CASCADE');
        table.text('name');
        table.text('description');
        table.integer('totalSeat');
        table.integer('seatInRow');
        table.integer('seatInColumn');
        table.string('format', 10);
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('halls');
}; 