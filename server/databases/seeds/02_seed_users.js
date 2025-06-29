
exports.seed = function (knex, Promise) {
  const data = [
    {
      "id": "1",
      "name": "Admin",
      "username": "admin",
      "password": "$2b$10$iNT.d38.rdsRvRMU95WTSu0ZMUBi/Dbwsrzw7yu0vT60T9EPu8eNi", // 123456@
      "email": "admin@gmail.com",
      "roleId": "1",
      "birthday": "01/01/1999",
      "phoneNumber": "0918762543"
    }
  ]

  // Deletes ALL existing entries
  return knex('users').del()
    .then(async () => {
      // Inserts seed entries
      await knex('users').insert(data);
      await knex.raw('select setval(\'users_id_seq\', max(id)) from users');
    });
};
