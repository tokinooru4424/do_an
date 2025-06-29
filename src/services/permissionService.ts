import Base from "./baseService";

class RolePermissionService extends Base {
  getPermissionByRoleId = async (data: { roleId: number }) => {
    return this.request({
      url: "/api/v1/rolePermissions/getPermissionByRoleId",
      method: "GET",
      data: data,
    });
  }
}

export default () => new RolePermissionService();
