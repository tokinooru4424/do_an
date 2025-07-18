import Base from "./baseService";

class PaymentService extends Base {
    createMomoPayment = async (data: {
        amount: number;
        orderInfo: string;
        returnUrl: string;
        notifyUrl: string;
        orderId: string;
    }) => {
        return this.request({
            url: "/api/v1/payment/momo/create",
            method: "POST",
            data: data,
        });
    };

    getPaymentStatus = async (orderId: string) => {
        return this.request({
            url: `/api/v1/payment/status/${orderId}`,
            method: "GET",
        });
    };

    saveFromFrontend = async (data: any) => {
        return this.request({
            url: "/api/v1/payment/momo/save",
            method: "POST",
            data: data,
        });
    };

    edit = async (data: { id: number, ticketId: number }) => {
        return this.request({
            url: `/api/v1/payments/${data.id}`,
            method: "PUT",
            data: data,
        });
    };
}

export default () => new PaymentService(); 