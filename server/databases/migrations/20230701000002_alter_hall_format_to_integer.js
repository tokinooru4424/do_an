exports.up = function (knex) {
    return knex.schema.alterTable('halls', function (table) {
        table.integer('format').alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('halls', function (table) {
        table.string('format', 10).alter();
    });
}; 