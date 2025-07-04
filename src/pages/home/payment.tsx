import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Radio, Typography, Divider, Spin, Layout, Avatar, Dropdown, Menu, Modal, message } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';
import styles from '@src/scss/pages/Home.module.scss';
import { useRouter } from 'next/router';
import auth from '@src/helpers/auth';
import RegisterModal from '@src/components/Auth/RegisterModal';
import LoginModal from '@src/components/Auth/LoginModal';
import ForgotPasswordModal from '@src/components/Auth/ForgotPasswordModal';
import PaymentService from '@src/services/paymentService';

const { Header, Footer } = Layout;

const PaymentPage = () => {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth().token);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('paymentData');
            console.log('paymentData from localStorage:', raw);
            if (raw) {
                try {
                    setData(JSON.parse(raw));
                } catch (e) {
                    console.error('Lỗi parse paymentData:', e);
                }
            }
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        auth().logout();
        setIsLoggedIn(false);
    };
    const user = auth().user;
    const menu = (
        <Menu>
            <Menu.Item key="profile">Thông tin cá nhân</Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>Đăng xuất</Menu.Item>
        </Menu>
    );
    const showRegisterModal = () => {
        setIsRegisterModalVisible(true);
        setIsLoginModalVisible(false);
        setIsForgotPasswordModalVisible(false);
    };
    const handleRegisterCancel = () => {
        setIsRegisterModalVisible(false);
    };
    const showLoginModal = () => {
        setIsLoginModalVisible(true);
        setIsRegisterModalVisible(false);
        setIsForgotPasswordModalVisible(false);
    };
    const handleLoginCancel = () => {
        setIsLoginModalVisible(false);
    };
    const showForgotPasswordModal = () => {
        setIsForgotPasswordModalVisible(true);
        setIsLoginModalVisible(false);
    };
    const handleForgotPasswordCancel = () => {
        setIsForgotPasswordModalVisible(false);
    };
    const handleRegisterClickFromLogin = () => {
        handleLoginCancel();
        showRegisterModal();
    };
    const handleLoginClickFromRegister = () => {
        handleRegisterCancel();
        showLoginModal();
    };
    const handleLoginSuccess = () => {
        setIsLoggedIn(!!auth().token);
        setIsLoginModalVisible(false);
    };

    if (loading) return <div style={{ color: '#fff', padding: 40 }}><Spin /> Đang tải...</div>;
    if (!data) return <div style={{ color: 'red', padding: 40 }}>Không tìm thấy dữ liệu thanh toán. Vui lòng quay lại chọn ghế.</div>;

    const { selectedSeats = [], seatTypes = {}, movie = {}, showtime = {}, cinema = {}, hall = {}, totalPrice = 0 } = data;

    // Tính chi tiết từng ghế
    const seatDetails = selectedSeats.map(seat => {
        const type = seatTypes[seat] || 'normal';
        const price = type === 'vip' ? 80000 : 70000;
        return { seat, type, price };
    });
    const totalFee = 0;
    const totalAll = totalPrice + totalFee;

    const handleMomoPayment = async () => {
        if (!isLoggedIn) {
            message.error('Vui lòng đăng nhập để thanh toán');
            return;
        }

        setPaymentLoading(true);
        try {
            const orderId = `ORDER_${Date.now()}`;
            const orderInfo = `Thanh toán vé xem phim: ${movie?.title || 'Unknown Movie'}`;

            // Sử dụng biến môi trường hoặc hardcode đúng port backend
            const backendBaseUrl = window.location.origin;
            const returnUrl = `${backendBaseUrl}/payment/success`;
            const notifyUrl = `${backendBaseUrl}/api/v1/payment/momo/callback`;

            const paymentData = {
                amount: totalAll,
                orderInfo: orderInfo,
                returnUrl: returnUrl,
                notifyUrl: notifyUrl,
                orderId: orderId
            };

            const response = await new PaymentService().createMomoPayment(paymentData);

            if (response.success && response.payUrl) {
                // Lưu thông tin đơn hàng vào localStorage để theo dõi
                localStorage.setItem('currentOrder', JSON.stringify({
                    orderId: orderId,
                    paymentData: data,
                    payUrl: response.payUrl
                }));

                // Chuyển hướng đến trang thanh toán MoMo
                window.location.href = response.payUrl;
            } else {
                message.error(response.message || 'Không thể tạo đơn hàng thanh toán');
            }
        } catch (error) {
            console.error('Lỗi thanh toán MoMo:', error);
            message.error('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div style={{ background: '#181b20', minHeight: '100vh' }}>
            <Header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <img src="/logo/logo.png" alt="Logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')} />
                    </div>
                    <nav className={styles.nav}>
                        <a href="/" className={router.pathname === '/' ? styles.active : ''}>Trang chủ</a>
                        <a href="/lich-chieu" className={router.pathname === '/lich-chieu' ? styles.active : ''}>Lịch chiếu</a>
                        <a href="/tin-tuc" className={router.pathname === '/tin-tuc' ? styles.active : ''}>Tin tức</a>
                        <a href="/khuyen-mai" className={router.pathname === '/khuyen-mai' ? styles.active : ''}>Khuyến mãi</a>
                        <a href="/gia-ve" className={router.pathname === '/gia-ve' ? styles.active : ''}>Giá vé</a>
                        <a href="/gioi-thieu" className={router.pathname === '/gioi-thieu' ? styles.active : ''}>Giới thiệu</a>
                        {isLoggedIn && (
                            <a onClick={() => router.push('/admin/dashboard')} className={router.pathname === '/admin/dashboard' ? styles.active : ''}>Quản lý</a>
                        )}
                    </nav>
                    <div className={styles.authButtons}>
                        {!isLoggedIn ? (
                            <>
                                <Button className={styles.signupButton} onClick={showRegisterModal}>Đăng ký</Button>
                                <Button type="primary" className={styles.loginButton} onClick={showLoginModal}>Đăng nhập</Button>
                            </>
                        ) : (
                            <Dropdown overlay={menu} trigger={['click']}>
                                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#fff' }}>
                                    <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                    {user?.firstName || user?.username || 'User'}
                                    <DownOutlined style={{ marginLeft: 8 }} />
                                </span>
                            </Dropdown>
                        )}
                    </div>
                </div>
            </Header>
            <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
                <div style={{ display: 'flex', gap: 32, width: 1200, maxWidth: '100%' }}>
                    {/* Cột trái */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {/* Thông tin phim */}
                        <div style={{ background: '#22252b', borderRadius: 16, padding: 32, color: '#fff' }}>
                            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Thông tin phim</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                                <div style={{ flex: 1, minWidth: 260 }}>
                                    <div style={{ fontWeight: 600, fontSize: 15, opacity: 0.8, marginBottom: 4 }}>Phim</div>
                                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>{movie?.title || 'Tên phim'}</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, opacity: 0.8, marginBottom: 4 }}>Ngày giờ chiếu</div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                                        <span style={{ color: '#ff6a3d', fontWeight: 700, fontSize: 22, marginRight: 12 }}>
                                            {showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </span>
                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>
                                            {showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString('vi-VN') : '--/--/----'}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 15, opacity: 0.8, marginBottom: 4 }}>Định dạng</div>
                                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>{hall?.format || '2D'}</div>
                                </div>
                                <div style={{ flex: 1, minWidth: 180, paddingLeft: 32, borderLeft: '1.5px solid #333' }}>
                                    <div style={{ fontWeight: 600, fontSize: 15, opacity: 0.8, marginBottom: 4 }}>Ghế</div>
                                    <div style={{ fontWeight: 800, fontSize: 22, color: '#ff3838', marginBottom: 20 }}>{selectedSeats.join(', ')}</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, opacity: 0.8, marginBottom: 4 }}>Phòng chiếu</div>
                                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>{hall?.name || hall?.label || ''}</div>
                                </div>
                            </div>
                        </div>
                        {/* Thông tin thanh toán */}
                        <div style={{ background: '#22252b', borderRadius: 16, padding: 32, color: '#fff' }}>
                            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Thông tin thanh toán</div>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'none', color: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                                <thead>
                                    <tr style={{ background: 'none', color: '#fff', fontWeight: 600, fontSize: 16 }}>
                                        <th style={{ textAlign: 'left', padding: 12 }}>Danh mục</th>
                                        <th style={{ textAlign: 'center', padding: 12 }}>Số lượng</th>
                                        <th style={{ textAlign: 'right', padding: 12 }}>Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seatDetails.map(({ seat, price }, idx) => (
                                        <tr key={seat} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: 12 }}>Ghế ({seat})</td>
                                            <td style={{ textAlign: 'center', padding: 12 }}>1</td>
                                            <td style={{ textAlign: 'right', padding: 12 }}>{price.toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Cột phải */}
                    <div style={{ flex: 1, background: '#22252b', borderRadius: 16, padding: 32, color: '#fff', minWidth: 340, maxWidth: 400 }}>
                        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Phương thức thanh toán</div>
                        <Form layout="vertical" onFinish={() => { }}>
                            <Form.Item name="paymentMethod" initialValue="momo" style={{ marginBottom: 24 }}>
                                <Radio.Group style={{ width: '100%' }}>
                                    <Radio.Button
                                        value="momo"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            marginBottom: 12,
                                            background: '#181b20',
                                            border: '1.5px solid #d63384',
                                            borderRadius: 12,
                                            padding: 16,
                                            color: '#d63384',
                                            fontWeight: 600,
                                            fontSize: 18,
                                            textAlign: 'left',
                                            lineHeight: 'normal'
                                        }}
                                    >
                                        <img
                                            src="/icons/momo.svg"
                                            alt="MoMo"
                                            style={{
                                                height: 24,
                                                width: 24,
                                                marginRight: 12,
                                                verticalAlign: 'middle',
                                                display: 'inline-block',
                                                flexShrink: 0
                                            }}
                                        />
                                        <span style={{ display: 'inline-block', lineHeight: 1 }}>MoMo Wallet</span>
                                    </Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            <div style={{ margin: '32px 0 16px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, marginBottom: 8, color: '#fff' }}>
                                    <span>Thanh toán</span>
                                    <span style={{ fontWeight: 700 }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, marginBottom: 8, color: '#fff' }}>
                                    <span>Phí</span>
                                    <span style={{ fontWeight: 700 }}>{totalFee.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 700, color: '#ff3838', marginBottom: 8 }}>
                                    <span>Tổng cộng</span>
                                    <span>{totalAll.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={paymentLoading}
                                onClick={handleMomoPayment}
                                style={{
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    fontSize: 18,
                                    background: 'linear-gradient(90deg, #d63384 0%, #e91e63 100%)',
                                    border: 'none',
                                    marginBottom: 16
                                }}
                            >
                                {paymentLoading ? 'Đang xử lý...' : 'Thanh toán bằng MoMo'}
                            </Button>

                            <Button
                                block
                                size="large"
                                style={{
                                    borderRadius: 24,
                                    fontWeight: 600,
                                    fontSize: 18,
                                    background: 'transparent',
                                    color: '#fff',
                                    border: '1.5px solid #fff'
                                }}
                                onClick={() => router.back()}
                            >
                                Quay lại
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
            <LoginModal
                visible={isLoginModalVisible}
                onCancel={handleLoginCancel}
                onRegisterClick={handleRegisterClickFromLogin}
                onForgotPasswordClick={showForgotPasswordModal}
                onLoginSuccess={handleLoginSuccess}
            />
            <RegisterModal
                visible={isRegisterModalVisible}
                onCancel={handleRegisterCancel}
                onLoginClick={handleLoginClickFromRegister}
            />
            <ForgotPasswordModal
                visible={isForgotPasswordModalVisible}
                onCancel={handleForgotPasswordCancel}
            />
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

export default PaymentPage; 