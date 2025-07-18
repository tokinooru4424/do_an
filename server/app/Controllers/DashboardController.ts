import BaseController from './BaseController';
import PaymentModel from '@app/Models/PaymentModel';
import TicketModel from '@app/Models/TicketModel';
import { raw } from 'objection';

export default class DashboardController extends BaseController {
  async summary() {
    // Tổng doanh thu (chỉ tính payment thành công)
    const totalRevenueResult = await PaymentModel.query()
      .where('status', 1)
      .sum('cost as total');
    const totalRevenue = Number((totalRevenueResult[0] as any)?.total || 0);

    // Số vé đã bán
    const totalTicketsResult = await TicketModel.query().count('id as count');
    const totalTickets = Number((totalTicketsResult[0] as any)?.count || 0);

    // Số giao dịch thành công
    const totalTransactionsResult = await PaymentModel.query()
      .where('status', 1)
      .count('id as count');
    const totalTransactions = Number((totalTransactionsResult[0] as any)?.count || 0);

    // Doanh thu theo tháng (MM/YYYY)
    const revenueByMonth = await PaymentModel.query()
      .where('status', 1)
      .select(raw("to_char(\"paymentTime\", 'MM/YYYY') as month"))
      .sum('cost as revenue')
      .groupBy('month')
      .orderBy('month', 'asc');

    // Doanh thu theo phim
    const revenueByMovie = await PaymentModel.query()
      .where('payments.status', 1)
      .leftJoin('tickets', 'payments.id', 'tickets.paymentId')
      .leftJoin('movies', 'tickets.movieId', 'movies.id')
      .select('movies.title as movie')
      .sum('payments.cost as revenue')
      .groupBy('movies.title')
      .orderBy('revenue', 'desc');

    return {
      totalRevenue,
      totalTickets,
      totalTransactions,
      revenueByMonth,
      revenueByMovie,
    };
  }
} 