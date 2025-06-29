
exports.seed = function (knex, Promise) {
  const data = [
    {
      "id": "1",
      "name": "root",
      "description": "root",
      "value": "15",
      "key": "root",
    },
    {
      "id": "2",
      "name": "Quản lý người dùng",
      "description": "Quản lý người dùng",
      "value": "15",
      "key": "users",
    },
    {
      "id": "3",
      "name": "Quản lý vai trò",
      "description": "Quản lý vai trò",
      "value": "15",
      "key": "roles",
    },
    {
      "id": "4",
      "name": "Phân quyền",
      "description": "Phân quyền",
      "value": "2",
      "key": "decentralization",
    },
    {
      "id": "5",
      "name": "Quản lý rạp chiếu",
      "description": "Xem, tạo, chỉnh sửa, xóa thông tin rạp chiếu",
      "value": "15",
      "key": "manage_cinemas",
    },
    {
      "id": "6",
      "name": "Quản lý phòng chiếu",
      "description": "Xem, tạo, chỉnh sửa, xóa thông tin phòng chiếu",
      "value": "15",
      "key": "manage_halls",
    },
    {
      "id": "7",
      "name": "Quản lý phim",
      "description": "Xem, tạo, chỉnh sửa, xóa thông tin phim",
      "value": "15",
      "key": "manage_movies",
    },
    {
      "id": "8",
      "name": "Quản lý suất chiếu",
      "description": "Xem, tạo, chỉnh sửa, xóa suất chiếu",
      "value": "15",
      "key": "manage_showtimes",
    },
    {
      "id": "9",
      "name": "Quản lý vé",
      "description": "Xem, hủy vé",
      "value": "3",
      "key": "manage_tickets",
    },
    {
      "id": "10",
      "name": "Quản lý thanh toán",
      "description": "Xem thông tin thanh toán",
      "value": "1",
      "key": "manage_payments",
    },
    {
      "id": "11",
      "name": "Quản lý voucher",
      "description": "Xem, tạo, chỉnh sửa, xóa voucher",
      "value": "15",
      "key": "manage_vouchers",
    },
    {
      "id": "12",
      "name": "Quản lý FAQ",
      "description": "Xem, tạo, chỉnh sửa, xóa câu hỏi thường gặp",
      "value": "15",
      "key": "manage_faq",
    },
    {
      "id": "13",
      "name": "Cài đặt",
      "description": "Chỉnh sửa các cài đặt cho hệ thống",
      "value": "15",
      "key": "settings",
    },
  ]

  // Deletes ALL existing entries
  return knex('permissions').del()
    .then(async () => {
      // Inserts seed entries
      await knex('permissions').insert(data);
      await knex.raw('select setval(\'permissions_id_seq\', max(id)) from permissions');
    });
};
