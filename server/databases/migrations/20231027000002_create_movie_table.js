exports.up = function (knex) {
    return knex.schema.createTable('movies', function (table) {
        table.increments('id').primary();
        table.text('title');
        table.text('genre');
        table.integer('duration');
        table.string('director', 255);
        table.text('cast');
        table.string('format', 10);
        table.string('language', 50);
        table.text('description');
        table.string('trailer'); // Assuming URL can be stored as string
        table.timestamp('realeaseDate');
        table.decimal('rating');
        table.integer('status');
        table.string('image', 255);
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('movies');
}; 