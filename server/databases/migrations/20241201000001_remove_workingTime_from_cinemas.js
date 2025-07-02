exports.up = function (knex) {
    return knex.schema.alterTable('cinemas', function (table) {
        table.dropColumn('workingTime');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('cinemas', function (table) {
        table.dateTime('workingTime');
    });
}; 