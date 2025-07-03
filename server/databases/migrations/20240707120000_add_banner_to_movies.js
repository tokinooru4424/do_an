const table = 'movies';

exports.up = function (knex) {
    return knex.schema.table(table, function (t) {
        t.string('banner', 255).nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table(table, function (t) {
        t.dropColumn('banner');
    });
}; 