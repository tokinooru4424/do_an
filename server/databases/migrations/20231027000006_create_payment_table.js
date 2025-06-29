exports.up = function (knex) {
    return knex.schema.createTable('payments', function (table) {
        table.increments('id').primary();
        table.integer('ticketId').references('id').inTable('tickets').onDelete('CASCADE');
        table.integer('userId').references('id').inTable('users').onDelete('SET NULL');
        table.integer('method');
        table.timestamp('paymentTime');
        table.decimal('cost');
        table.string('transactionID', 100);
        table.integer('status');
        // Assuming createAt and updateAt are desired based on other tables
        table.timestamp('createAt').defaultTo(knex.fn.now());
        table.timestamp('updateAt').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('payments');
}; 