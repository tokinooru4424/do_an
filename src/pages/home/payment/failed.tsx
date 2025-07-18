import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Typography, Layout } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@src/scss/pages/Home.module.scss';
import MainHeader from '@src/components/Layout/MainHeader';

const { Title, Text } = Typography;
const { Header, Footer } = Layout;

const PaymentFailedPage = () => {
    const router = useRouter();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Lấy thông tin đơn hàng từ URL params hoặc localStorage
        const { orderId, message: errorMessage } = router.query;
        const savedOrder = localStorage.getItem('currentOrder');

        if (savedOrder) {
            try {
                setOrderData(JSON.parse(savedOrder));
            } catch (e) {
                console.error('Lỗi parse order data:', e);
            }
        }
    }, [router.query]);

    const handleGoHome = () => {
        // Xóa dữ liệu đơn hàng khỏi localStorage
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('paymentData');
        router.push('/');
    };

    const handleRetry = () => {
        // Quay lại trang thanh toán
        router.push('/payment');
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
                        icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
                        status="error"
                        title={
                            <Title level={2} style={{ color: '#fff', marginBottom: 16 }}>
                                Thanh toán thất bại!
                            </Title>
                        }
                        subTitle={
                            <Text style={{ color: '#ccc', fontSize: 16 }}>
                                Rất tiếc, giao dịch thanh toán của bạn không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                            </Text>
                        }
                        extra={[
                            <Button
                                type="primary"
                                size="large"
                                icon={<ReloadOutlined />}
                                onClick={handleRetry}
                                style={{
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    background: 'linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)',
                                    border: 'none',
                                    height: 48,
                                    padding: '0 32px',
                                    marginRight: 16
                                }}
                            >
                                Thử lại
                            </Button>,
                            <Button
                                size="large"
                                icon={<HomeOutlined />}
                                onClick={handleGoHome}
                                style={{
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    fontSize: 16,
                                    background: 'transparent',
                                    color: '#fff',
                                    border: '1.5px solid #fff',
                                    height: 48,
                                    padding: '0 32px'
                                }}
                            >
                                Về trang chủ
                            </Button>
                        ]}
                    />

                    {orderData && (
                        <div style={{
                            marginTop: 32,
                            padding: 24,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 12,
                            textAlign: 'left'
                        }}>
                            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
                                Thông tin lỗi
                            </Title>
                            <div style={{ color: '#ccc', lineHeight: 1.8 }}>
                                <div><strong>Mã đơn hàng:</strong> {orderData.orderId}</div>
                                <div><strong>Lỗi:</strong> {router.query.message || 'Không xác định'}</div>
                                <div><strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}</div>
                            </div>
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

export default PaymentFailedPage; 