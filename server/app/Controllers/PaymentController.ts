import * as crypto from 'crypto';
import axios from 'axios';
import PaymentModel from '@app/Models/PaymentModel';
import ApiException from '@app/Exceptions/ApiException';

const partnerCode = 'MOMO';
const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

export default class PaymentController {
    async createMomoPayment({ request }) {
        try {
            const { amount, orderInfo, returnUrl, orderId } = request.body;

            const requestId = orderId + Date.now();
            const requestType = 'payWithMethod';
            const extraData = '';
            const lang = 'vi';
            const autoCapture = true;
            const orderGroupId = '';
            const ipnUrl = "https://17f9dcb11c71.ngrok-free.app/api/payment/momo-callback"

            const rawSignature = 
            `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            const requestBody = {
                partnerCode,
                partnerName: 'TMD Cinema',
                storeId: 'TMDStore',
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl: returnUrl,
                ipnUrl,
                lang,
                requestType,
                autoCapture,
                extraData,
                orderGroupId,
                signature
            };

            const momoResponse = await axios.post(endpoint, requestBody, {
                headers: { 'Content-Type': 'application/json' }
            });

            const responseData = momoResponse.data;

            if (responseData.resultCode === 0) {
                // Trả về dữ liệu đơn giản cho frontend
                return {
                    success: true,
                    payUrl: responseData.payUrl,
                    orderId,
                    requestId
                };
            } else {
                throw new ApiException(400, responseData.message || 'Không thể tạo đơn hàng thanh toán');
            }
        } catch (error) {
            console.error('Lỗi tạo thanh toán MoMo:', error);
            throw new ApiException(500, 'Lỗi server khi tạo thanh toán');
        }
    }

    // Thêm hàm mới để lưu từ frontend
    async saveFromFrontend({ request }) {
        const {
            partnerCode, orderId, requestId, amount, orderInfo, orderType,
            transId, resultCode, message, payType, responseTime, extraData, signature
        } = request.body;

        const payment = await PaymentModel.query().insert({
            method: 1, // 1 = MoMo
            paymentTime: new Date(),
            cost: amount,
            transactionID: transId,
            status: resultCode == 0 ? 1 : 0,
            // Có thể thêm các trường khác nếu cần
        });

        return { success: true, id: payment.id };
    }

    async momoReturn({ request }) {
        try {
            const {
                partnerCode,
                orderId,
                requestId,
                amount,
                orderInfo,
                orderType,
                transId,
                resultCode,
                message,
                payType,
                signature,
                extraData
            } = request.query || request.body || {};

            // Log toàn bộ dữ liệu MoMo trả về khi return
            console.log('--- MoMo RETURN DATA ---');
            console.log('partnerCode:', partnerCode);
            console.log('orderId:', orderId);
            console.log('requestId:', requestId);
            console.log('amount:', amount);
            console.log('orderInfo:', orderInfo);
            console.log('orderType:', orderType);
            console.log('transId:', transId);
            console.log('resultCode:', resultCode);
            console.log('message:', message);
            console.log('payType:', payType);
            console.log('signature:', signature);
            console.log('extraData:', extraData);
            console.log('request.query:', request.query);

            // Không trả về object phức tạp, chỉ trả về object đơn giản để middleware xử lý
            if (resultCode == 0 || resultCode === '0') {
                // Thành công
                return { redirect: `/payment/success?orderId=${orderId}` };
            } else {
                // Thất bại
                return { redirect: `/payment/failed?orderId=${orderId}&message=${encodeURIComponent(message || 'Thanh toán thất bại')}` };
            }
        } catch (error) {
            console.error('Lỗi xử lý return MoMo:', error);
            throw new ApiException(500, 'Internal server error');
        }
    }

} 