import BaseController from './BaseController'
import ShowTimeModel from '@app/Models/ShowTimeModel'
import ApiException from '@app/Exceptions/ApiException'
import { raw } from 'objection'

export default class ShowTimeController extends BaseController {
    Model: typeof ShowTimeModel = ShowTimeModel

    async index() {
        let inputs = this.request.all()
        let project = [
            'showTimes.id as id',
            'showTimes.movieId',
            'movies.title as movieName',
            'showTimes.hallId',
            'halls.name as hallName',
            'halls.cinemaId as cinemaId',
            'showTimes.startTime',
            'showTimes.endTime',
            'showTimes.format',
            'showTimes.language',
            'showTimes.subtitle',
            'showTimes.createdAt',
        ]

        let result = await this.Model.query()
            .leftJoin('movies', 'showTimes.movieId', 'movies.id')
            .leftJoin('halls', 'showTimes.hallId', 'halls.id')
            .select(project)
            .getForGridTable(inputs)

        return result
    }

    async store() {
        let inputs = this.request.all()
        const allowFields = {
            movieId: "number!",
            hallId: "number!",
            startTime: "string!",
            endTime: "string!",
            format: "number!",
            language: "string",
            subtitle: "string"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })
        // Kiểm tra nếu startTime trước thời điểm hiện tại
        const now = new Date();
        const startTime = new Date(params.startTime);
        if (startTime < now) {
            throw new ApiException(6303, 'Không thể tạo suất chiếu với thời gian trong quá khứ!');
        }
        const overlap = await this.Model.query()
            .where('hallId', params.hallId)
            .where(raw('NOT ("endTime" <= ? OR "startTime" >= ?)', [params.startTime, params.endTime]))
            .first();
        if (overlap) throw new ApiException(6302, 'Đã có suất chiếu khác trong phòng này trùng thời gian!');
        let result = await this.Model.insertOne(params)
        return result
    }

    async update() {
        let inputs = this.request.all()
        const allowFields = {
            id: "number!",
            movieId: "number!",
            hallId: "number!",
            startTime: "string!",
            endTime: "string!",
            format: "number!",
            language: "string",
            subtitle: "string"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })
        const { id } = params
        delete params.id

        // Kiểm tra nếu startTime trước thời điểm hiện tại
        const now = new Date();
        const startTime = new Date(params.startTime);
        if (startTime < now) {
            throw new ApiException(6303, 'Không thể cập nhật suất chiếu với thời gian trong quá khứ!');
        }

        let exist = await this.Model.getById(id)
        if (!exist) throw new ApiException(6301, "ShowTime doesn't exist!")
        const overlap = await this.Model.query()
            .where('hallId', params.hallId)
            .where(raw('NOT ("endTime" <= ? OR "startTime" >= ?)', [params.startTime, params.endTime]))
            .where('id', '!=', id)
            .first();
        if (overlap) throw new ApiException(6302, 'Đã có suất chiếu khác trong phòng này trùng thời gian!');
        let result = await this.Model.updateOne(id, { ...params })
        return { result, old: exist }
    }

    async destroy() {
        let inputs = this.request.all()
        const allowFields = { id: "number!" }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })

        let exist = await this.Model.getById(params.id)
        if (!exist) throw new ApiException(6301, "ShowTime doesn't exist!")

        let result = await this.Model.deleteById(params.id)
        return { message: "ShowTime deleted successfully", result, old: exist }
    }

    async detail() {
        let inputs = this.request.all()
        const allowFields = { id: "number!" }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })

        let result = await this.Model.query()
            .leftJoin('movies', 'showTimes.movieId', 'movies.id')
            .leftJoin('halls', 'showTimes.hallId', 'halls.id')
            .leftJoin('cinemas', 'halls.cinemaId', 'cinemas.id')
            .select(
                'showTimes.*',
                'movies.title as movieName',
                'movies.duration as duration',
                'movies.format as movieFormat',
                'halls.name as hallName',
                'halls.format as hallFormat',
                'halls.cinemaId as cinemaId',
                'cinemas.name as cinemaName'
            )
            .where('showTimes.id', params.id)
            .first()

        if (!result) throw new ApiException(6301, "ShowTime doesn't exist!")
        return result
    }

    async select2() {
        const data = this.request.all()
        const project = [
            'startTime as label',
            'id as value'
        ]
        let result = await this.Model.query()
            .select(project)
            .getForGridTable(data);

        return result;
    }
} 