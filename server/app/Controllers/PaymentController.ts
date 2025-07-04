import * as crypto from 'crypto';
import axios from 'axios';

const partnerCode = 'MOMO';
const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

export default class PaymentController {
    async createMomoPayment({ request, response }) {
        try {
            const { amount, orderInfo, returnUrl, notifyUrl, orderId } = request.body;

            const requestId = orderId + Date.now();
            const requestType = 'payWithMethod';
            const extraData = '';
            const lang = 'vi';
            const autoCapture = true;
            const orderGroupId = '';

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${requestType}`;
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
                ipnUrl: notifyUrl,
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
                return response.json({
                    success: true,
                    payUrl: responseData.payUrl,
                    orderId,
                    requestId
                });
            } else {
                return response.status(400).json({
                    success: false,
                    message: 'Không thể tạo đơn hàng thanh toán',
                    error: responseData.message
                });
            }
        } catch (error) {
            console.error('Lỗi tạo thanh toán MoMo:', error);
            return response.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo thanh toán'
            });
        }
    }

    async momoCallback({ request, response }) {
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
            } = request.body;

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${request.url}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&resultCode=${resultCode}&transId=${transId}`;
            const expectedSignature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error('Invalid signature from MoMo');
                return response.status(400).json({ error: 'Invalid signature' });
            }

            if (resultCode === 0) {
                console.log(`Thanh toán thành công cho đơn hàng: ${orderId}, transId: ${transId}`);
                return response.json({ success: true });
            } else {
                console.log(`Thanh toán thất bại cho đơn hàng: ${orderId}, message: ${message}`);
                return response.json({ success: false, message });
            }
        } catch (error) {
            console.error('Lỗi xử lý callback MoMo:', error);
            return response.status(500).json({ error: 'Internal server error' });
        }
    }

    async momoReturn({ request, response }) {
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
            } = request.body;

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${request.url}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&resultCode=${resultCode}&transId=${transId}`;
            const expectedSignature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            if (signature !== expectedSignature) {
                return response.redirect('/payment/failed?error=invalid_signature');
            }

            if (resultCode === 0) {
                return response.redirect(`/payment/success?orderId=${orderId}&transId=${transId}`);
            } else {
                return response.redirect(`/payment/failed?orderId=${orderId}&message=${encodeURIComponent(message)}`);
            }
        } catch (error) {
            console.error('Lỗi xử lý return MoMo:', error);
            return response.redirect('/payment/failed?error=server_error');
        }
    }
} 