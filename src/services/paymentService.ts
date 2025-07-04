import axios from 'axios';

class PaymentService {
    private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

    async createMomoPayment(data: {
        amount: number;
        orderInfo: string;
        returnUrl: string;
        notifyUrl: string;
        orderId: string;
    }) {
        try {
            const response = await axios.post(`${this.baseURL}/payment/momo/create`, data);
            return response.data;
        } catch (error) {
            console.error('Lỗi tạo thanh toán MoMo:', error);
            throw error;
        }
    }

    async getPaymentStatus(orderId: string) {
        try {
            const response = await axios.get(`${this.baseURL}/payment/status/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Lỗi lấy trạng thái thanh toán:', error);
            throw error;
        }
    }
}

export default PaymentService; 