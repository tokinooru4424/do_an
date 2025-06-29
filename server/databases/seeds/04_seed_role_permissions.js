
exports.seed = function (knex, Promise) {
  const data = [
    {
      "id": "1",
      "roleId": "1",
      "permissionId": "1",
      "value": "15",
      "key": "root",
    },
    {
      "id": "2",
      "roleId": "1",
      "permissionId": "2",
      "value": "15",
      "key": "users",
    },
    {
      "id": "3",
      "roleId": "1",
      "permissionId": "3",
      "value": "15",
      "key": "roles",
    },
    {
      "id": "4",
      "roleId": "1",
      "permissionId": "4",
      "value": "2",
      "key": "decentralization",
    }
  ]

  // Deletes ALL existing entries
  return knex('role_permissions').del()
    .then(async () => {
      // Inserts seed entries
      await knex('role_permissions').insert(data);
      await knex.raw('select setval(\'role_permissions_id_seq\', max(id)) from role_permissions');
    });
};
