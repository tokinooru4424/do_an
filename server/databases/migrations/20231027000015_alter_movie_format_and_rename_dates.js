exports.up = async function (knex) {
    // Đổi kiểu dữ liệu cột format sang integer
    await knex.schema.alterTable('movies', function (table) {
        table.integer('format').alter();
    });

    // Đổi tên cột createAt thành createdAt, updateAt thành updatedAt
    await knex.schema.alterTable('movies', function (table) {
        table.renameColumn('createAt', 'createdAt');
        table.renameColumn('updateAt', 'updatedAt');
    });
};

exports.down = async function (knex) {
    // Rollback: Đổi lại kiểu dữ liệu cột format về string(50)
    await knex.schema.alterTable('movies', function (table) {
        table.string('format', 50).alter();
    });

    // Rollback: Đổi lại tên cột về cũ
    await knex.schema.alterTable('movies', function (table) {
        table.renameColumn('createdAt', 'createAt');
        table.renameColumn('updatedAt', 'updateAt');
    });
}; 