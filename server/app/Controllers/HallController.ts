import BaseController from './BaseController'
import HallModel from '@app/Models/HallModel'
import ApiException from '@app/Exceptions/ApiException'

export default class HallController extends BaseController {
    Model: typeof HallModel = HallModel

    async index() {
        let inputs = this.request.all()
        let project = [
            'halls.id as id',
            'halls.name',
            'halls.description',
            'halls.format',
            'cinemas.name as cinemaName',
            'halls.createdAt'
        ]

        let result = await this.Model.query()
            .leftJoin('cinemas', 'halls.cinemaId', 'cinemas.id')
            .select(project)
            .getForGridTable(inputs)

        return result
    }

    async store() {
        let inputs = this.request.all()
        const allowFields = {
            name: "string!",
            cinemaId: "number!",
            description: "string",
            format: "number!",
            totalSeat: "number",
            seatInRow: "number",
            seatInColumn: "number"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })
        let result = await this.Model.insertOne(params)
        return result
    }

    async update() {
        let inputs = this.request.all()
        const allowFields = {
            id: "number!",
            name: "string!",
            cinemaId: "number!",
            description: "string",
            format: "number!",
            totalSeat: "number",
            seatInRow: "number",
            seatInColumn: "number"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })
        const { id } = params
        delete params.id

        let exist = await this.Model.getById(id)
        if (!exist) throw new ApiException(6006, "Hall doesn't exist!")

        let result = await this.Model.updateOne(id, { ...params })
        return { result, old: exist }
    }

    async destroy() {
        let inputs = this.request.all()
        const allowFields = { id: "number!" }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })

        let exist = await this.Model.getById(params.id)
        if (!exist) throw new ApiException(6006, "Hall doesn't exist!")

        let result = await this.Model.deleteById(params.id)
        return { message: "Hall deleted successfully", result, old: exist }
    }

    async detail() {
        let inputs = this.request.all()
        const allowFields = { id: "number!" }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })

        let result = await this.Model.query()
            .leftJoin('cinemas', 'halls.cinemaId', 'cinemas.id')
            .select(
                'halls.*',
                'cinemas.name as cinema_name'
            )
            .where('halls.id', params.id)
            .first()

        if (!result) throw new ApiException(6006, "Hall doesn't exist!")
        return result
    }

    async select2() {
        const data = this.request.all()
        const project = [
            'halls.name as label',
            'halls.id as value',
            'halls.format as hallFormat',
            'halls.cinemaId',
            'cinemas.name as cinemaName',
            'halls.totalSeat',
            'halls.seatInRow',
            'halls.seatInColumn'
        ]
        let result = await this.Model.query()
            .leftJoin('cinemas', 'halls.cinemaId', 'cinemas.id')
            .select(project)
            .getForGridTable(data);

        return result;
    }
} 