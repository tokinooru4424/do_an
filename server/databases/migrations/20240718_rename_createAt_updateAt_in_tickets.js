exports.up = async function(knex) {
  await knex.schema.alterTable('tickets', function(table) {
    table.renameColumn('createAt', 'createdAt');
    table.renameColumn('updateAt', 'updatedAt');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('tickets', function(table) {
    table.renameColumn('createdAt', 'createAt');
    table.renameColumn('updatedAt', 'updateAt');
  });
}; 