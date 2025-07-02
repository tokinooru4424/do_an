import BaseController from './BaseController'
import CinemaModel from '@app/Models/CinemaModel'
import ApiException from '@app/Exceptions/ApiException'
import _ from 'lodash'

export default class CinemaController extends BaseController {
    Model: typeof CinemaModel = CinemaModel

    async index() {
        const { auth } = this.request;
        let inputs = this.request.all()
        let project = [
            "cinemas.id as id",
            "cinemas.name",
            "cinemas.email",
            "cinemas.phoneNumber",
            "cinemas.address",
            "cinemas.description",
            "cinemas.createdAt",
        ]

        let result = await this.Model.query()
            .select(project)
            .getForGridTable(inputs)

        return result;
    }

    async store() {
        const { auth } = this.request
        let inputs = this.request.all()
        const allowFields = {
            name: "string!",
            email: "string!",
            phoneNumber: "string!",
            address: "string!",
            description: "string"
        }

        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        let emailExist = await this.Model.findExist(params.email, 'email')
        if (emailExist) throw new ApiException(6021, "Email already exists!")

        let result = await this.Model.insertOne(params);

        return result
    }

    async update() {
        let inputs = this.request.all()
        const allowFields = {
            id: "number!",
            name: "string!",
            email: "string!",
            phoneNumber: "string!",
            address: "string!",
            description: "string"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        const { id } = params
        delete params.id

        let exist = await this.Model.getById(id)
        if (!exist) throw new ApiException(6006, "Cinema doesn't exists!")

        let emailExist = await this.Model.getOne({ email: params.email })
        if (emailExist && emailExist.id !== exist.id) throw new ApiException(6021, "Email already exists!")

        let result = await this.Model.updateOne(id, { ...params });

        return {
            result,
            old: exist
        }
    }

    async destroy() {
        let inputs = this.request.all()
        const allowFields = {
            id: "number!"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        let exist = await this.Model.getById(params.id)
        if (!exist) throw new ApiException(6006, "Cinema doesn't exists!")

        let result = await this.Model.deleteById(params.id);

        return {
            message: "Cinema deleted successfully",
            result,
            old: exist
        }
    }

    async delete() {
        let inputs = this.request.all()
        const allowFields = {
            ids: "array!"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        let exist = await this.Model.query().whereIn('id', params.ids)
        if (exist.length === 0) throw new ApiException(6006, "Cinemas don't exist!")

        let result = await this.Model.query().whereIn('id', params.ids).delete();

        return {
            result,
            deletedCount: exist.length
        }
    }

    async getInfo() {
        const { auth } = this.request;
        let inputs = this.request.all()
        const allowFields = {
            id: "number!"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        let result = await this.Model.getById(params.id)
        if (!result) throw new ApiException(6006, "Cinema doesn't exists!")

        return result
    }

    async detail() {
        const { auth } = this.request;
        let inputs = this.request.all()
        const allowFields = {
            id: "number!"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        let result = await this.Model.getById(params.id)
        if (!result) throw new ApiException(6006, "Cinema doesn't exists!")

        return result
    }
}
