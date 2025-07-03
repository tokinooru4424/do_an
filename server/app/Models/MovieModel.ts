import BaseModel from './BaseModel'

class MovieModel extends BaseModel {
    static tableName = 'movies'

    id!: number;
    title!: string;
    genre!: string;
    duration!: number;
    director?: string;
    cast?: string;
    format!: number;
    country?: string;
    description?: string;
    trailer?: string;
    realeaseDate?: Date;
    rating?: number;
    status?: number;
    image?: string;
    banner?: string;
    createdAt!: Date;
    updatedAt!: Date;
}

export default MovieModel 