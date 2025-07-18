import BaseModel from './BaseModel';
import TicketModel from './TicketModel';

export default class PaymentModel extends BaseModel {
  static tableName = 'payments';

  id: number;
  userId: number;
  method: number;
  paymentTime: Date;
  cost: number;
  transactionID: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;

} 