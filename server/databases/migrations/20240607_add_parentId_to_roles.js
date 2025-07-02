exports.up = function (knex) {
    return knex.schema.alterTable('roles', function (table) {
        table.integer('parentId').nullable().references('id').inTable('roles').onDelete('SET NULL');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('roles', function (table) {
        table.dropColumn('parentId');
    });
}; 