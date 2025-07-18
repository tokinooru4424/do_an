import BaseController from './BaseController'
import TicketModel from '@app/Models/TicketModel'
import ApiException from '@app/Exceptions/ApiException'
import _ from 'lodash'
import PaymentModel from '../Models/PaymentModel'
import ShowTimeModel from '../Models/ShowTimeModel'
import MovieModel from '../Models/MovieModel'
import HallModel from '../Models/HallModel'
import CinemaModel from '../Models/CinemaModel'

export default class TicketController extends BaseController {
    Model: typeof TicketModel = TicketModel

    async store() {
        let inputs = this.request.all()
        const allowFields = {
            paymentId: "number!",
            showTimeId: "number!",
            movieId: "number!",
            userId: "number!",
            bookingTime: "string!",
            format: "number!",
            price: "number!",
            seatNumber: "string!",
        }

        let params = this.validate(inputs, allowFields, { removeNotAllow: true });

        let result = await this.Model.insertOne(params);

        return result
    }

    
    // API: GET /api/v1/payment/ticket-info?orderId=...
    async ticketInfo({ request }) {
        try {
            const { orderId, transactionID, paymentId, ticketId } = request.query || request.body || {};
            let payment;

            if (paymentId) {
                payment = await PaymentModel.query().findById(paymentId);
            } else if (orderId) {
                payment = await PaymentModel.query().where('transactionID', orderId).first();
            } else if (transactionID) {
                payment = await PaymentModel.query().where('transactionID', transactionID).first();
            }

            if (!payment) {
                throw new ApiException(404, 'Không tìm thấy thông tin thanh toán!');
            }

            let ticket;
            if (ticketId) {
                ticket = await TicketModel.query().findById(ticketId);
            } else {
                ticket = await TicketModel.query().where('paymentId', payment.id).first();
            }

            if (!ticket) {
                throw new ApiException(404, 'Không tìm thấy thông tin vé!');
            }

            const showTime = await ShowTimeModel.query().findById(ticket.showTimeId);
            const movie = showTime ? await MovieModel.query().findById(showTime.movieId) : null;
            const hall = showTime ? await HallModel.query().findById(showTime.hallId) : null;
            const cinema = hall ? await CinemaModel.query().findById(hall.cinemaId) : null;

            return {
                movie: {
                    id: movie?.id,
                    title: movie?.title,
                    duration: movie?.duration,
                },
                showTime: {
                    id: showTime?.id,
                    startTime: showTime?.startTime,
                    endTime: showTime?.endTime,
                },
                cinema: {
                    id: cinema?.id,
                    name: cinema?.name,
                    address: cinema?.address,
                },
                hall: {
                    id: hall?.id,
                    name: hall?.name,
                },
                ticket: {
                    id: ticket.id,
                    seatNumber: ticket.seatNumber,
                    seatCode: ticket.seatCode,
                    format: ticket.format,
                    price: ticket.price,
                    userId: ticket.userId,
                },
                payment: {
                    id: payment.id,
                    cost: payment.cost,
                    method: payment.method,
                    paymentTime: payment.paymentTime ? payment.paymentTime.toString() : null,
                    status: payment.status,
                    transactionID: payment.transactionID,
                }
            };
        } catch (error) {
            console.error('Lỗi lấy thông tin vé:', error);
            throw new ApiException(500, 'Internal server error');
        }
    }

    async getBookedSeats({ request }) {
        const { showTimeId } = request.query;
        if (!showTimeId) throw new ApiException(400, 'Thiếu showTimeId');

        // Lấy tất cả ticket của suất chiếu này
        const tickets = await TicketModel.query().where('showTimeId', showTimeId);

        // Trả về mảng các ghế đã đặt
        let bookedSeats = [];
        tickets.forEach((ticket: any) => {
            if (ticket.seatNumber) {
                bookedSeats = bookedSeats.concat(ticket.seatNumber.split(','));
            }
        });

        return { bookedSeats };
    }
}