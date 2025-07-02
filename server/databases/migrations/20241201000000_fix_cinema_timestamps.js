exports.up = function (knex) {
    return knex.schema.alterTable('cinemas', function (table) {
        table.renameColumn('createAt', 'createdAt');
        table.renameColumn('updateAt', 'updatedAt');
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('cinemas', function (table) {
        table.renameColumn('createdAt', 'createAt');
        table.renameColumn('updatedAt', 'updateAt');
    });
}; 