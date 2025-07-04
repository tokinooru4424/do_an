import React, { useState } from 'react';
import { Tabs, Card, Descriptions, Table, Layout, Button, Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, HistoryOutlined, DownOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@src/scss/pages/Home.module.scss';
import useBaseHook from '@src/hooks/BaseHook';
import RegisterModal from '@src/components/Auth/RegisterModal';
import LoginModal from '@src/components/Auth/LoginModal';
import ForgotPasswordModal from '@src/components/Auth/ForgotPasswordModal';
import auth from '@src/helpers/auth';

const { Header, Footer } = Layout;

const mockUser = {
    username: 'admin',
    fullName: 'Trương Minh Đức',
    email: 'admin@example.com',
    phone: '0973786798',
    gender: 'Nam',
    dob: '1998-01-01',
};

const mockHistory = [
    {
        key: '1',
        movie: 'Godzilla x Kong',
        date: '2024-07-04',
        time: '07:30',
        seats: 'F6, F7',
        price: 140000,
        status: 'Thành công',
    },
    {
        key: '2',
        movie: 'Dune 2',
        date: '2024-06-20',
        time: '19:00',
        seats: 'C3, C4',
        price: 140000,
        status: 'Thành công',
    },
];

const columns = [
    { title: <span style={{ fontWeight: 700 }}>Phim</span>, dataIndex: 'movie', key: 'movie' },
    { title: <span style={{ fontWeight: 700 }}>Ngày</span>, dataIndex: 'date', key: 'date' },
    { title: <span style={{ fontWeight: 700 }}>Giờ</span>, dataIndex: 'time', key: 'time' },
    { title: <span style={{ fontWeight: 700 }}>Ghế</span>, dataIndex: 'seats', key: 'seats' },
    { title: <span style={{ fontWeight: 700 }}>Giá</span>, dataIndex: 'price', key: 'price', align: 'right' as const, render: (v) => <span style={{ fontWeight: 700 }}>{v.toLocaleString('vi-VN')}đ</span> },
    { title: <span style={{ fontWeight: 700 }}>Trạng thái</span>, dataIndex: 'status', key: 'status', align: 'center' as const, render: (v) => v === 'Thành công' ? <span style={{ color: '#52c41a', fontWeight: 700 }}><CheckCircleTwoTone twoToneColor="#52c41a" /> {v}</span> : v },
];

const ProfilePage = () => {
    const { redirect } = useBaseHook();
    const router = useRouter();
    const [activeKey, setActiveKey] = useState('info');
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth().token);
    const user = auth().user;
    const [activeLink, setActiveLink] = useState(router.pathname);

    const showRegisterModal = () => {
        setIsRegisterModalVisible(true);
        setIsLoginModalVisible(false);
        setIsForgotPasswordModalVisible(false);
    };
    const handleRegisterCancel = () => setIsRegisterModalVisible(false);
    const showLoginModal = () => {
        setIsLoginModalVisible(true);
        setIsRegisterModalVisible(false);
        setIsForgotPasswordModalVisible(false);
    };
    const handleLoginCancel = () => setIsLoginModalVisible(false);
    const showForgotPasswordModal = () => {
        setIsForgotPasswordModalVisible(true);
        setIsLoginModalVisible(false);
    };
    const handleForgotPasswordCancel = () => setIsForgotPasswordModalVisible(false);
    const handleRegisterClickFromLogin = () => {
        handleLoginCancel();
        showRegisterModal();
    };
    const handleLoginClickFromRegister = () => {
        handleRegisterCancel();
        showLoginModal();
    };
    const handleLogout = () => {
        auth().logout();
        setIsLoggedIn(false);
        router.push('/');
    };
    const handleMenuClick = (e) => {
        if (e.key === 'profile') {
            router.push('/home/profile');
        }
        if (e.key === 'logout') {
            handleLogout();
        }
    };
    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="profile">Thông tin cá nhân</Menu.Item>
            <Menu.Item key="logout">Đăng xuất</Menu.Item>
        </Menu>
    );

    return (
        <div style={{ background: '#181b20', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <Header className={`${styles.header}`}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <img src="/logo/logo.png" alt="Logo" style={{ cursor: 'pointer' }} onClick={() => router.push('/')} />
                    </div>
                    <nav className={styles.nav}>
                        <a href="/" className={activeLink === '/' ? styles.active : ''}>Trang chủ</a>
                        <a href="/lich-chieu" className={activeLink === '/lich-chieu' ? styles.active : ''}>Lịch chiếu</a>
                        <a href="/tin-tuc" className={activeLink === '/tin-tuc' ? styles.active : ''}>Tin tức</a>
                        <a href="/khuyen-mai" className={activeLink === '/khuyen-mai' ? styles.active : ''}>Khuyến mãi</a>
                        <a href="/gia-ve" className={activeLink === '/gia-ve' ? styles.active : ''}>Giá vé</a>
                        <a href="/gioi-thieu" className={activeLink === '/gioi-thieu' ? styles.active : ''}>Giới thiệu</a>
                        {isLoggedIn && (
                            <a onClick={() => redirect("frontend.admin.dashboard.index")} className={activeLink === '/admin/dashboard' ? styles.active : ''}>Quản lý</a>
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
            <div style={{ height: 32 }} />
            <div style={{ maxWidth: 900, margin: '40px auto', background: '#22252b', borderRadius: 16, padding: 32, color: '#fff', flex: 1, marginTop: 32 }}>
                <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    tabBarStyle={{ marginBottom: 32, color: '#fff' }}
                    items={[
                        {
                            key: 'info',
                            label: <span style={{ color: '#fff' }}><UserOutlined /> Thông tin cá nhân</span>,
                            children: (
                                <Card bordered={false} style={{ background: 'none', color: '#fff' }}>
                                    <Descriptions column={1} labelStyle={{ color: '#fff', fontWeight: 600 }} contentStyle={{ color: '#fff', fontWeight: 700 }}>
                                        <Descriptions.Item label="Tên đăng nhập">{mockUser.username}</Descriptions.Item>
                                        <Descriptions.Item label="Họ tên">{mockUser.fullName}</Descriptions.Item>
                                        <Descriptions.Item label="Email">{mockUser.email}</Descriptions.Item>
                                        <Descriptions.Item label="Số điện thoại">{mockUser.phone}</Descriptions.Item>
                                        <Descriptions.Item label="Giới tính">{mockUser.gender}</Descriptions.Item>
                                        <Descriptions.Item label="Ngày sinh">{mockUser.dob}</Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            ),
                        },
                        {
                            key: 'history',
                            label: <span style={{ color: '#fff' }}><HistoryOutlined /> Lịch sử đặt vé</span>,
                            children: (
                                <Card bordered={false} style={{ background: 'rgba(30,32,36,0.98)', color: '#fff', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 0 }}>
                                    <Table
                                        columns={columns}
                                        dataSource={mockHistory}
                                        pagination={false}
                                        style={{ background: 'none', color: '#fff', borderRadius: 16 }}
                                        rowClassName={(_, idx) => idx % 2 === 0 ? 'custom-row' : 'custom-row-alt'}
                                        bordered
                                    />
                                </Card>
                            ),
                        },
                    ]}
                />
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
            <RegisterModal visible={isRegisterModalVisible} onCancel={handleRegisterCancel} onLoginClick={handleLoginClickFromRegister} />
            <LoginModal visible={isLoginModalVisible} onCancel={handleLoginCancel} onRegisterClick={handleRegisterClickFromLogin} onForgotPasswordClick={showForgotPasswordModal} />
            <ForgotPasswordModal visible={isForgotPasswordModalVisible} onCancel={handleForgotPasswordCancel} />
            <style jsx global>{`
                .ant-table-thead > tr > th {
                    background: #23262b !important;
                    color: #fff !important;
                    font-weight: 700 !important;
                    border-top-left-radius: 12px;
                    border-top-right-radius: 12px;
                }
                .ant-table-tbody > tr.custom-row:hover td, .ant-table-tbody > tr.custom-row-alt:hover td {
                    background: #23262b !important;
                    transition: background 0.2s;
                    color: #fff !important;
                }
                .ant-table-tbody > tr.custom-row td {
                    background: #23262b;
                    color: #fff !important;
                }
                .ant-table-tbody > tr.custom-row-alt td {
                    background: #1e2024;
                    color: #fff !important;
                }
                .ant-table {
                    border-radius: 16px !important;
                    overflow: hidden;
                }
                .ant-table-cell, .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
};

export default ProfilePage; 