import BaseController from './BaseController'
import UserModel from '@root/server/app/Models/UserModel'
import RoleModel from '@app/Models/RoleModel'
import ApiException from '@app/Exceptions/ApiException'
import baseUpload from "@root/server/utils/uploadExcel"
import MailService from '@app/Services/Mail'
import _ from 'lodash'

const { validateUpload, validateDataExistInDBByColumn, isEmail,
  mapErrorsToGridTable, mapError, validateNotAllowDataExistInDBByColumn
} = baseUpload;

export default class AdminController extends BaseController {
  Model: typeof UserModel = UserModel
  RoleModel: any = RoleModel

  async index() {
    const { auth } = this.request;
    let inputs = this.request.all()
    let project = [
      "users.id as id",
      "users.username",
      "users.firstName",
      "users.lastName",
      "users.email",
      "users.roleId",
      "users.createdAt",
      "roles.name as roleName"
    ]

    let result = await this.Model.query()
      .leftJoin('roles', 'users.roleId', 'roles.id')
      .select(project)
      .getForGridTable(inputs)

    return result;
  }

  async store() {
    const { auth } = this.request
    let inputs = this.request.all()
    const allowFields = {
      firstName: "string!",
      lastName: "string!",
      username: "string!",
      password: "string!",
      roleId: "number!",
      email: "string!"
    }

    let params = this.validate(inputs, allowFields, { removeNotAllow: true });

    let username = params.username.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
    let usernameExist = await this.Model.findExist(username, 'username')
    if (usernameExist) throw new ApiException(6007, "Username already exists!")

    let emailExist = await this.Model.findExist(params.email, 'email')
    if (emailExist) throw new ApiException(6021, "Email already exists!")

    let role = await this.RoleModel.getById(params.roleId)
    if (!role) throw new ApiException(6000, "User role not exists!")

    let password = params['password']
    if (params['password']) params['password'] = await this.Model.hash(params['password']);

    params = {
      ...params,
      roleId: role.id,
      createdBy: auth.id
    }

    const templateKey = "createUser"
    let variables = {
      fullname: `${_.get(params, 'lastName', '')} ${_.get(params, 'firstName', '')}`,
      username,
      password
    }

    MailService.send({
      to: params.email,
      templateKey: templateKey,
      variables
    })

    let result = await this.Model.insertOne(params);
    delete result['password']

    return result
  }

  async update() {
    let inputs = this.request.all()
    const allowFields = {
      id: "number!",
      firstName: "string!",
      lastName: "string!",
      email: "string!"
    }
    let params = this.validate(inputs, allowFields, { removeNotAllow: true });

    const { id } = params
    delete params.id

    let exist = await this.Model.getById(id)
    if (!exist) throw new ApiException(6006, "User doesn't exists!")

    let emailExist = await this.Model.getOne({ email: params.email })
    if (emailExist && emailExist.id !== exist.id) throw new ApiException(6021, "Email already exists!")

    let result = await this.Model.updateOne(id, { ...params });
    delete result['password']

    return {
      result,
      old: exist
    }
  }

  async importExcel() {
    let inputs = this.request.all();
    const { auth } = this.request
    let { warring, errors, data } = await this._beforeUpload({ inputs: inputs.users, auth });
    warring = (warring || []).sort((a, b) => a.row - b.row)

    if (errors) {
      let errorsForGridTable = mapErrorsToGridTable(errors);
      throw new ApiException(4000, `Nhập excel xảy ra lỗi!`, { error: errorsForGridTable });
    }

    // await this.Model.insertMany(data)

    return {
      warring,
    }
  }

  async _beforeUpload({ inputs, auth }) {
    let errors = {};
    let warring = [];
    const validationNormal = validateUpload([...inputs], {
      allowFieldsOfRow: {
        username: "string!",
        firstName: "string!",
        lastName: "string!",
        email: "string",
        roleName: "string!",
      },
      removeNotAllow: true,
      duplicate: true,
      unique: ["username", "email"],
      validationFields: {
        email: [isEmail],
      }
    });

    inputs = validationNormal.inputs;

    // Kiểm tra đầu vào ok chưa rồi mới tiếp tục kiểm tra dữ liệu trong DB
    if (JSON.stringify(validationNormal.errors) != "{}") {
      return {
        warring: warring || [],
        errors: validationNormal.errors,
        data: inputs
      }
    }

    // Check username
    const errorExistUsername = await validateNotAllowDataExistInDBByColumn({
      inputs: JSON.parse(JSON.stringify(inputs)),
      property: "username",
      ignoreUndefined: true,
      Model: this.Model,
      column: "username",
      extend_conditions: {},
      error_code: "DATA_EXIST_IN_DB",
      comment: "",
    });

    // Check role
    const checkRole = await validateDataExistInDBByColumn({
      inputs: JSON.parse(JSON.stringify(inputs)),
      property: "roleName",
      ignoreUndefined: true,
      Model: this.RoleModel,
      column: "name",
      extend_conditions: {},
      error_code: "ROLE_NOT_EXIST",
      comment: "",
      deleteProperties: ["roleName"],
      setColumnsToProperties: [{ columnName: "id", newProperty: "roleId" }]
    });
    inputs = checkRole.inputs;

    let errorExistEmail = {}
    for (let i in inputs) {
      if (inputs[i].email) {
        // Check email
        errorExistEmail = await validateNotAllowDataExistInDBByColumn({
          inputs: JSON.parse(JSON.stringify(inputs)),
          property: "email",
          ignoreUndefined: true,
          Model: this.Model,
          column: "email",
          extend_conditions: {},
          error_code: "DATA_EXIST_IN_DB",
          comment: "",
        });
      }

      const password = '123456'
      inputs[i]['password'] = await this.Model.hash(password);
      inputs[i]['createdBy'] = auth.id
    }

    errors = mapError(
      validationNormal.errors,
      checkRole.errors,
      errorExistEmail,
      errorExistUsername,
    );

    console.log(errors)

    return {
      warring: warring || [],
      errors: (JSON.stringify(errors) == "{}" || !errors) ? null : errors,
      data: inputs,
    };
  }

  async destroy() {
    const { auth } = this.request
    let params = this.request.all();

    let id = params.id;
    if (!id) throw new ApiException(9996, "ID is required!");

    let exist = await this.Model.getById(id)
    if (!exist) throw new ApiException(6006, "User doesn't exists!")
    if ([id].includes(auth.id)) throw new ApiException(6022, "You can not remove your account.")

    let user = await this.Model.query().where('id', params.id).first()
    await user.$query().delete()

    return {
      message: `Delete successfully`,
      old: user
    }
  }

  async delete() {
    const { auth } = this.request
    const allowFields = {
      ids: ["number!"]
    }
    const inputs = this.request.all();
    let params = this.validate(inputs, allowFields);

    let exist = await this.Model.query().whereIn('id', params.ids)
    if (!exist || exist.length !== params.ids.length) throw new ApiException(6006, "User doesn't exists!")
    if (params.ids.includes(auth.id)) throw new ApiException(6022, "You can not remove your account.")

    let users = await this.Model.query().whereIn('id', params.ids)
    for (let user of users) {
      await user.$query().delete()
    }

    return {
      old: {
        usernames: (users || []).map(user => user.username).join(', ')
      }
    };
  }

  async getInfo() {
    const { auth } = this.request;
    let result = await this.Model.getById(auth.id);
    delete result['password']

    if (!result) throw new ApiException(6006, "User doesn't exist")

    return result
  }
}
