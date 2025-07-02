import Base from "./baseService";

const name = 'cinemas'

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
}

export default () => new usersService();
