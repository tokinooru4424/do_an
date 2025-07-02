import BaseModel from './BaseModel'

class CinemaModel extends BaseModel {
    static tableName = 'cinemas'

    id!: number
    name!: string
    email!: string
    phoneNumber!: string
    address!: string
    description?: string
    createdAt!: Date
    updatedAt!: Date

    $beforeInsert() {
        this.createdAt = new Date()
        this.updatedAt = new Date()
    }

    $beforeUpdate() {
        this.updatedAt = new Date()
    }
}

export default CinemaModel 