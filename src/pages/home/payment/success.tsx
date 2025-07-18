import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Typography,Dropdown, Avatar, Layout } from 'antd';
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@src/scss/pages/Home.module.scss';
import PaymentService from '@src/services/paymentService';
import TicketService from '@src/services/ticketService';
import useBaseHook from '@src/hooks/BaseHook';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import MainHeader from '@src/components/Layout/MainHeader';
import auth from '@src/helpers/auth';

const { Title, Text } = Typography;
const { Header, Footer } = Layout;

const PaymentSuccessPage = () => {
    const router = useRouter();
    const [ticketInfo, setTicketInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Lấy paymentData từ localStorage
        let paymentData = null;
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('paymentData');
            if (raw) {
                try {
                    paymentData = JSON.parse(raw);
                } catch (e) {}
            }
        }
        const {
            partnerCode, orderId, requestId, orderInfo, orderType,
            transId, resultCode, message, payType, responseTime, extraData, signature
        } = router.query;
        // Lấy đúng amount từ paymentData
        const amount = paymentData?.totalPrice || 0;
        if (orderId && amount > 0) {
            PaymentService().saveFromFrontend({
                partnerCode, orderId, requestId, amount, orderInfo, orderType,
                transId, resultCode, message, payType, responseTime, extraData, signature
            })
            .then(async (paymentRes) => {
                // Lấy paymentId trả về từ backend
                const paymentId = paymentRes.id;
                // Sau khi lưu payment thành công, tạo ticket với đúng thông tin
                console.log(paymentData);
                const ticketData = {
                    showTimeId: paymentData?.showtime?.id,
                    movieId: paymentData?.showtime?.movieId,
                    userId: auth().user?.id,
                    bookingTime: new Date().toISOString(),
                    seatNumber: paymentData?.selectedSeats?.join(','),
                    format: paymentData?.hall?.hallFormat,
                    price: amount,
                    paymentId: paymentId // Gán paymentId cho ticket
                };
                try {
                    await TicketService().create(ticketData);   
                    await TicketService().ticketInfo({
                        paymentId: paymentId
                    }).then(async (ticketRes) => {
                        setTicketInfo(ticketRes);
                        setLoading(false);
                    });
                } catch (err) {
                    console.error('Lỗi tạo ticket:', err);
                }
            })
            .catch(err => {
                // Xử lý khi lưu payment thất bại
                console.error('Lỗi lưu payment:', err);
            });
        }
    }, [router.query]);

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div style={{ background: '#181b20', minHeight: '100vh' }}>
            <MainHeader />

            <div style={{
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px'
            }}>
                <Card style={{
                    background: '#22252b',
                    border: 'none',
                    borderRadius: 16,
                    maxWidth: 600,
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <Result
                        icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 72 }} />}
                        status="success"
                        title={
                            <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
                                Thanh toán thành công!
                            </Title>
                        }
                        subTitle={
                            <Text style={{ color: '#ccc', fontSize: 16 }}>
                                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Vé của bạn đã được xác nhận.
                            </Text>
                        }
                        extra={[
                            <Button
                                type="primary"
                                size="large"
                                icon={<HomeOutlined />}
                                onClick={handleGoHome}
                                style={{
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    background: 'linear-gradient(90deg, #52c41a 0%, #73d13d 100%)',
                                    border: 'none',
                                    height: 48,
                                    padding: '0 32px'
                                }}
                            >
                                Về trang chủ
                            </Button>
                        ]}
                    />

                    {loading && <div style={{ color: '#fff', marginTop: 24 }}>Đang tải thông tin vé...</div>}
                    {error && <div style={{ color: 'red', marginTop: 24 }}>{error}</div>}
                    {ticketInfo && ticketInfo.ticket && ticketInfo.showTime && ticketInfo.movie && ticketInfo.hall && ticketInfo.cinema && (
                        <div style={{
                            marginTop: 32,
                            padding: 24,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 12,
                            textAlign: 'left',
                            color: '#fff'
                        }}>
                            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
                                Thông tin vé xem phim
                            </Title>
                            <div><strong>Mã vé:</strong> {ticketInfo.ticket.id}</div>
                            <div><strong>Phim:</strong> {ticketInfo.movie.title}</div>
                            <div><strong>Suất chiếu:</strong> {new Date(ticketInfo.showTime.startTime).toLocaleString('vi-VN')}</div>
                            <div><strong>Rạp:</strong> {ticketInfo.cinema.name}</div>
                            <div><strong>Phòng chiếu:</strong> {ticketInfo.hall.name}</div>
                            <div><strong>Ghế:</strong> {ticketInfo.ticket.seatNumber}</div>
                            <div><strong>Giá vé:</strong> {Number(ticketInfo.payment.cost).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</div>
                            <div><strong>Thời gian thanh toán:</strong> {new Date(ticketInfo.payment.paymentTime).toLocaleString('vi-VN')}</div>
                        </div>
                    )}
                </Card>
            </div>

            <Footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerMiddle}>
                        <p>Bản quyền thuộc Rạp chiếu phim TMD</p>
                        <p>Chịu trách nhiệm: Trương Minh Đức – Giám đốc.</p>
                        <p>Địa chỉ: 175 Tây Sơn, Quận Đống Đa, Tp. Hà Nội - Điện thoại: 0973786798</p>
                    </div>
                </div>
            </Footer>
        </div>
    );
};

export default PaymentSuccessPage; 