exports.up = function (knex) {
    return knex.schema.createTable('vouchers', function (table) {
        table.string('code', 50).unique();
        table.text('description');
        table.integer('type');
        table.decimal('value');
        table.timestamp('expireDate');
        table.integer('status');
        // Assuming createAt and updateAt are desired based on other tables
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('vouchers');
}; 