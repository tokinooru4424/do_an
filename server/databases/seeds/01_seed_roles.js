
exports.seed = function (knex, Promise) {
  const data = [
    {
      "id": "1",
      "name": "Root",
      "description": "Root",
      "key": "root"
    },
    {
      "id": "2",
      "name": "Quản lý rạp chiếu",
      "description": "Quản lý các hoạt động của rạp chiếu",
      "key": "cinema_manager",
    },
    {
      "id": "3",
      "name": "Nhân viên bán vé",
      "description": "Thực hiện bán vé và dịch vụ",
      "key": "ticket_seller",
    },
    {
      "id": "4",
      "name": "Khách hàng",
      "description": "Người dùng thông thường",
      "key": "customer",
    },
  ]

  // Deletes ALL existing entries
  return knex('roles').del()
    .then(async () => {
      // Inserts seed entries
      await knex('roles').insert(data);
      await knex.raw('select setval(\'roles_id_seq\', max(id)) from roles');
    });
};
