exports.up = async function (knex) {
    // Đổi tên cột cho bảng cinemas

    // Đổi tên cột cho bảng halls
    await knex.schema.alterTable('halls', function (table) {
        table.renameColumn('createAt', 'createdAt');
        table.renameColumn('updateAt', 'updatedAt');
    });

    // Đổi tên cột cho bảng seatTypes
    await knex.schema.alterTable('seatTypes', function (table) {
        table.renameColumn('createAt', 'createdAt');
        table.renameColumn('updateAt', 'updatedAt');
    });

    // Đổi tên cột cho bảng payments
    await knex.schema.alterTable('payments', function (table) {
        table.renameColumn('createAt', 'createdAt');
        table.renameColumn('updateAt', 'updatedAt');
    });

    // Đổi tên cột cho bảng faqs
    await knex.schema.alterTable('faqs', function (table) {
        table.renameColumn('createAt', 'createdAt');
        table.renameColumn('updateAt', 'updatedAt');
    });
};

exports.down = async function (knex) {
    // Rollback: Đổi lại tên cột về cũ

    await knex.schema.alterTable('halls', function (table) {
        table.renameColumn('createdAt', 'createAt');
        table.renameColumn('updatedAt', 'updateAt');
    });

    await knex.schema.alterTable('seatTypes', function (table) {
        table.renameColumn('createdAt', 'createAt');
        table.renameColumn('updatedAt', 'updateAt');
    });

    await knex.schema.alterTable('payments', function (table) {
        table.renameColumn('createdAt', 'createAt');
        table.renameColumn('updatedAt', 'updateAt');
    });

    await knex.schema.alterTable('faqs', function (table) {
        table.renameColumn('createdAt', 'createAt');
        table.renameColumn('updatedAt', 'updateAt');
    });
}; 