import BaseModel from './BaseModel'
import CinemaModel from './CinemaModel'

class HallModel extends BaseModel {
    static tableName = 'halls'

    id!: number
    name!: string
    cinemaId!: number
    description?: string
    format?: number
    totalSeat!: number
    seatInRow!: number
    seatInColumn!: number
    createdAt!: Date
    updatedAt!: Date

    static get relationMappings() {
        return {
            cinema: {
                relation: BaseModel.BelongsToOneRelation,
                modelClass: CinemaModel,
                join: {
                    from: `${this.tableName}.cinemaId`,
                    to: 'cinemas.id'
                }
            }
        }
    }
}

export default HallModel 