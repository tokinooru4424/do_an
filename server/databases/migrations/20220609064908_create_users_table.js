
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.string('email').notNullable();
    table.integer('phoneNumber').notNullable();
    table.timestamp('birthday').notNullable();
    table.integer('roleId').index().references('id').inTable('roles')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};