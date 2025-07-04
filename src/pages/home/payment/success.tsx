import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Typography, Layout } from 'antd';
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@src/scss/pages/Home.module.scss';

const { Title, Text } = Typography;
const { Header, Footer } = Layout;

const PaymentSuccessPage = () => {
    const router = useRouter();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Lấy thông tin đơn hàng từ URL params hoặc localStorage
        const { orderId, transId } = router.query;
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

    return (
        <div style={{ background: '#181b20', minHeight: '100vh' }}>
            <Header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <img src="/logo/logo.png" alt="Logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')} />
                    </div>
                </div>
            </Header>

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

                    {orderData && (
                        <div style={{
                            marginTop: 32,
                            padding: 24,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 12,
                            textAlign: 'left'
                        }}>
                            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
                                Thông tin đơn hàng
                            </Title>
                            <div style={{ color: '#ccc', lineHeight: 1.8 }}>
                                <div><strong>Mã đơn hàng:</strong> {orderData.orderId}</div>
                                <div><strong>Giao dịch:</strong> {router.query.transId || 'N/A'}</div>
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

export default PaymentSuccessPage; 