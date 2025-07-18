import React, { useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Menu } from 'antd';
import { UserOutlined, DownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '@src/scss/pages/Home.module.scss';
import useBaseHook from '@src/hooks/BaseHook';
import auth from '@src/helpers/auth';

const { Header } = Layout;

const MainHeader = () => {
    const router = useRouter();
    const { redirect } = useBaseHook();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState(router.pathname);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth().token);
    const user = auth().user;

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

    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={() => router.push('/home/profile')}>Thông tin cá nhân</Menu.Item>
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
                    {isLoggedIn && (
                        <a onClick={() => redirect("frontend.admin.dashboard.index")} className={activeLink === '/admin/dashboard' ? styles.active : ''}>Quản lý</a>
                    )}
                </nav>
                <div className={styles.authButtons}>
                    {!isLoggedIn ? (
                        <>
                            <Button className={styles.signupButton} onClick={() => router.push('/register')}>Đăng ký</Button>
                            <Button type="primary" className={styles.loginButton} onClick={() => router.push('/login')}>Đăng nhập</Button>
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
    );
};

export default MainHeader; 