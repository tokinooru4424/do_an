exports.up = function (knex) {
    // Đổi kiểu dữ liệu cột phoneNumber từ integer sang varchar(255)
    return knex.schema.alterTable('users', function (table) {
        table.string('phoneNumber').alter();
    });
};

exports.down = function (knex) {
    // Đổi lại kiểu dữ liệu cột phoneNumber từ varchar về integer
    return knex.schema.alterTable('users', function (table) {
        table.integer('phoneNumber').alter();
    });
};