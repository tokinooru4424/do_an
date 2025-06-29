exports.up = function (knex) {
    return knex.schema.createTable('showTimes', function (table) {
        table.increments('id').primary();
        table.integer('movieId').references('id').inTable('movies').onDelete('CASCADE');
        table.integer('hallId').references('id').inTable('halls').onDelete('CASCADE');
        table.timestamp('startTime');
        table.timestamp('endTime');
        table.string('format', 50);
        table.string('language', 50);
        table.string('subtitle', 50);
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('showTimes');
}; 