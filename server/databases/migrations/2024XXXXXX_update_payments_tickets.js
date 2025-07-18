exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('payments', function(table) {
      table.dropColumn('ticketId');
    }),
    knex.schema.table('tickets', function(table) {
      table.integer('paymentId').unsigned().nullable();
      table.foreign('paymentId').references('payments.id').onDelete('SET NULL');
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('payments', function(table) {
      table.integer('ticketId').nullable();
    }),
    knex.schema.table('tickets', function(table) {
      table.dropForeign('paymentId');
      table.dropColumn('paymentId');
    })
  ]);
}; 