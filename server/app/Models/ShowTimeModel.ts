import BaseModel from './BaseModel'
import MovieModel from './MovieModel'
import HallModel from './HallModel'

class ShowTimeModel extends BaseModel {
    static tableName = 'showTimes'

    id!: number
    movieId!: number
    hallId!: number
    startTime!: Date
    endTime!: Date
    format!: number
    language?: string
    subtitle?: string
    createdAt!: Date
    updatedAt!: Date

    static get relationMappings() {
        return {
            movie: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: MovieModel,
                join: {
                    from: `${this.tableName}.movieId`,
                    to: 'movies.id'
                }
            },
            hall: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: HallModel,
                join: {
                    from: `${this.tableName}.hallId`,
                    to: 'halls.id'
                }
            }
        }
    }
}

export default ShowTimeModel 