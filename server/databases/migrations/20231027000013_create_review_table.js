exports.up = function (knex) {
    return knex.schema.createTable('reviews', function (table) {
        table.increments('id').primary();
        table.integer('userId').references('id').inTable('users').onDelete('CASCADE');
        table.integer('movieId').references('id').inTable('movies').onDelete('CASCADE');
        table.decimal('rating');
        table.text('movieReview');
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
        table.unique(['userId', 'movieId']); // Assuming a user can only review a movie once
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('reviews');
}; 