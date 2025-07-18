import BaseModel from './BaseModel';
import MovieModel from './MovieModel';
import PaymentModel from './PaymentModel';
import HallModel from './HallModel';
import ShowTimeModel from './ShowTimeModel';
import UserModel from './UserModel';
import CinemaModel from './CinemaModel';

export default class TicketModel extends BaseModel {
  static tableName = 'tickets';

  id: number;
  showTimeId: number;
  seat: string;
  seatCode: string;
  userId: number;
  paymentId: number;
  createdAt: Date;
  updatedAt: Date;

  static get relationMappings() {
    return {
      showTime: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: ShowTimeModel,
        join: {
          from: 'ticket.showTimeId',
          to: 'showTimes.id'
        }
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'ticket.userId',
          to: 'users.id'
        }
      },
      payment: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PaymentModel,
        join: {
          from: 'ticket.paymentId',
          to: 'payments.id'
        }
      },
      movie: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: MovieModel,
        join: {
          from: 'ticket.movieId',
          to: 'movies.id'
        }
      },
    }
  }
} 