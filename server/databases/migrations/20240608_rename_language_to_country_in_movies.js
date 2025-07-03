exports.up = function (knex) {
    return knex.schema.table('movies', function (table) {
        table.renameColumn('language', 'country');
    });
};

exports.down = function (knex) {
    return knex.schema.table('movies', function (table) {
        table.renameColumn('country', 'language');
    });
}; 