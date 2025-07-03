import BaseController from './BaseController'
import MovieModel from '@app/Models/MovieModel'
import ApiException from '@app/Exceptions/ApiException'

export default class MovieController extends BaseController {
    Model: typeof MovieModel = MovieModel

    async index() {
        let inputs = this.request.all()
        let project = [
            'movies.id as id',
            'movies.title',
            'movies.genre',
            'movies.duration',
            'movies.director',
            'movies.cast',
            'movies.format',
            'movies.country',
            'movies.description',
            'movies.trailer',
            'movies.realeaseDate',
            'movies.rating',
            'movies.status',
            'movies.image',
            'movies.createdAt',
            'movies.updatedAt'
        ]

        let result = await this.Model.query()
            .select(project)
            .getForGridTable(inputs)

        return result
    }

    async store() {
        let inputs = this.request.all()
        const allowFields = {
            title: "string!",
            genre: "string!",
            duration: "number!",
            director: "string",
            cast: "string",
            format: "number!",
            country: "string",
            description: "string",
            trailer: "string",
            realeaseDate: "date",
            rating: "number",
            status: "number",
            image: "string"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })
        let result = await this.Model.insertOne(params)
        return result
    }

    async update() {
        let inputs = this.request.all()
        const allowFields = {
            id: "number!",
            title: "string!",
            genre: "string!",
            duration: "number!",
            director: "string",
            cast: "string",
            format: "number!",
            country: "string",
            description: "string",
            trailer: "string",
            realeaseDate: "date",
            rating: "number",
            status: "number",
            image: "string"
        }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })
        const { id } = params
        delete params.id

        let exist = await this.Model.getById(id)
        if (!exist) throw new ApiException(6401, "Movie doesn't exist!")

        let result = await this.Model.updateOne(id, { ...params })
        return { result, old: exist }
    }

    async destroy() {
        let inputs = this.request.all()
        const allowFields = { id: "number!" }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })

        let exist = await this.Model.getById(params.id)
        if (!exist) throw new ApiException(6401, "Movie doesn't exist!")

        let result = await this.Model.deleteById(params.id)
        return { message: "Movie deleted successfully", result, old: exist }
    }

    async detail() {
        let inputs = this.request.all()
        const allowFields = { id: "number!" }
        let params = this.validate(inputs, allowFields, { removeNotAllow: true })

        let result = await this.Model.query()
            .select('movies.*')
            .where('movies.id', params.id)
            .first()

        if (!result) throw new ApiException(6401, "Movie doesn't exist!")
        return result
    }

    async select2() {
        const data = this.request.all()
        const project = [
            'title as label',
            'id as value',
            'format',
            'duration'
        ]
        let result = await this.Model.query()
            .select(project)
            .getForGridTable(data);

        return result;
    }
} 