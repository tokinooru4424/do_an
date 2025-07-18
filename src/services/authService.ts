import Base from "./baseService";
import auth from '@src/helpers/auth'

class AuthService extends Base {
  login = async ({ email, password, otp, remember }: {
    email: string; password: string; otp?: string; remember?: boolean
  }) => {
    return this.request({
      url: "/api/v1/login",
      method: "POST",
      data: { email, password, otp, remember },
    });
  };

  logout = async ({ username }: { username: string }) => {
    auth().logout();
    return this.request({
      url: "/api/v1/logout",
      method: "POST",
      data: { username },
    });
  };

  changePassword = async ({ password }: { password: string }) => {
    return this.request({
      url: "/api/v1/changePassword",
      method: "POST",
      data: { password },
    });
  };

  forgotPassword = async ({ data }: { data: { email: string } }) => {
    return this.request({
      url: "/api/v1/forgotPassword",
      method: "POST",
      data: data,
    });
  }

  checkToken = async ({ data }: { data: { token: string } }) => {
    return this.request({
      url: "/api/v1/checkToken/:token",
      method: "GET",
      data: data,
    });
  }

  resetPassword = async ({ data }: { data: { newPassword: string, token: string } }) => {
    return this.request({
      url: "/api/v1/resetPassword",
      method: "POST",
      data: data,
    });
  }

  register = async ({ email, password, name, username, phoneNumber, birthday }: { email: string; password: string; name: string; username: string; phoneNumber: string; birthday: string }) => {
    return this.request({
      url: "/api/v1/register",
      method: "POST",
      data: { email, password, name, username, phoneNumber, birthday },
    });
  };
}

export default () => new AuthService();
