import Base from "./baseService";

const name = 'users'

class usersService extends Base {
  index = async (filter: any) => {
    return this.request({
      url: `/api/v1/${name}`,
      method: "GET",
      data: filter,
    });
  };

  create = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}`,
      method: "POST",
      data: data,
    });
  };

  importExcel = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/importExcel`,
      method: "POST",
      data: data,
    });
  }

  detail = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/:id`,
      method: "GET",
      data: data,
    });
  };

  edit = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/:id`,
      method: "PUT",
      data: data,
    });
  };

  delete = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}`,
      method: "DELETE",
      data: data,
    });
  };

  destroy = async (data: any) => {
    return this.request({
      url: `/api/v1/${name}/:id`,
      method: "DELETE",
      data: data,
    });
  };

  getInfo = async (data: any  ) => {
    return this.request({
      url: `/api/v1/${name}/getInfoUser`,
      method: 'GET', 
      data: data,
    });
  };

  updateInfo = async (data: any) => {
    return this.request({
      url: `/api/v1/users/updateInfo`,
      method: 'PUT',
      data: data,
    });
  };

  changePassword = async ({ password }: { password: string }) => {
    return this.request({
      url: `/api/v1/changePassword`,
      method: 'POST',
      data: { password },
    });
  };
}

export default () => new usersService();
