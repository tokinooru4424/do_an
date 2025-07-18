exports.up = async function(knex) {
  await knex.schema.alterTable('users', function(table) {
    table.string('gender').nullable();
  });
};
 
exports.down = async function(knex) {
  await knex.schema.alterTable('users', function(table) {
    table.dropColumn('gender');
  });
}; 