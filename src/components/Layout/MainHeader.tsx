import React, { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Menu } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@src/scss/pages/Home.module.scss';
import useBaseHook from '@src/hooks/BaseHook';
import auth from '@src/helpers/auth';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';
import ForgotPasswordModal from '../Auth/ForgotPasswordModal';
import ChangePassword from '@src/components/GeneralComponents/ChangePassword';
import AuthService from '@src/services/authService';
import { message } from 'antd';

const { Header } = Layout;

const MainHeader = () => {
    const router = useRouter();
    const { redirect } = useBaseHook();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState(router.pathname);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth().token);
    const user = auth().user;
    console.log(user);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setActiveLink(router.pathname);
    }, [router.pathname]);

    const handleLogout = () => {
        auth().logout();
        setIsLoggedIn(false);
        router.push('/');
    };

    const handleChangePassword = async (values) => {
        try {
            await AuthService().withAuth().changePassword({ password: values.password });
            message.success('Đổi mật khẩu thành công!');
            setShowChangePassword(false);
        } catch (err) {
            message.error(err?.message || 'Đổi mật khẩu thất bại!');
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={() => router.push('/home/profile')}>Thông tin cá nhân</Menu.Item>
            <Menu.Item key="changePassword" onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>Đăng xuất</Menu.Item>
        </Menu>
    );

    return (
        <Header className={`${styles.header} ${isScrolled ? styles.blur : ''}`}>
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
                    {isLoggedIn && Number((user as any)?.roleId) !== 4 && (
                        <a onClick={() => redirect("frontend.admin.dashboard.index")} className={activeLink === '/admin/dashboard' ? styles.active : ''}>Quản lý</a>
                    )}
                </nav>
                <div className={styles.authButtons}>
                    {!isLoggedIn ? (
                        <>
                            <Button className={styles.signupButton} onClick={() => setShowRegister(true)}>Đăng ký</Button>
                            <Button type="primary" className={styles.loginButton} onClick={() => setShowLogin(true)}>Đăng nhập</Button>
                            <LoginModal visible={showLogin} onCancel={() => setShowLogin(false)} onRegisterClick={() => setShowRegister(true)} onForgotPasswordClick={() => setShowForgotPassword(true)} />
                            <RegisterModal visible={showRegister} onCancel={() => setShowRegister(false)} onLoginClick={() => setShowLogin(true)} />
                            <ForgotPasswordModal visible={showForgotPassword} onCancel={() => setShowForgotPassword(false)} />
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
            <ChangePassword
                visible={showChangePassword}
                onCancel={() => setShowChangePassword(false)}
                onChangePassword={handleChangePassword}
            />
        </Header>
    );
};

export default MainHeader; 