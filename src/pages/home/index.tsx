import React, { useEffect, useState } from 'react';
import { Layout, Button, Carousel, Card, Row, Col, Avatar, Dropdown, Menu } from 'antd';
import { RightOutlined, DownOutlined, UserOutlined } from '@ant-design/icons';
import styles from '@src/scss/pages/Home.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/router';
import useBaseHook from '@src/hooks/BaseHook';
import RegisterModal from '@src/components/Auth/RegisterModal';
import LoginModal from '@src/components/Auth/LoginModal';
import ForgotPasswordModal from '@src/components/Auth/ForgotPasswordModal';
import auth from '@src/helpers/auth';
import movieService from '@src/services/movieService';
import useSWR from 'swr';
import constant from 'config/constant';

const { Header, Content, Footer } = Layout;

const Home = () => {
    const { t, notify, redirect, getData } = useBaseHook();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const router = useRouter();
    const [activeLink, setActiveLink] = useState(router.pathname);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth().token);
    const user = auth().user;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        const handleRouteChange = (url: string) => {
            setActiveLink(url);
        };

        window.addEventListener('scroll', handleScroll);
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    useEffect(() => {
        fetch('http://localhost:3333/api/v1/movies')
            .then(res => res.json())
            .then(data => console.log('Test fetch:', data))
            .catch(err => console.error('Test fetch error:', err));
    }, []);

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

    const handleLogout = () => {
        auth().logout();
        setIsLoggedIn(false);
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

    const upcomingMovies = [
        {
            id: 5,
            title: 'BÍ KÍP LUYỆN RỒNG',
            poster: 'https://via.placeholder.com/300x450?text=Bi+Kip+Luyen+Rong',
            ageRating: 'P',
            duration: '98 phút',
            genre: 'Hoạt hình, Phiêu lưu',
            country: 'Mỹ',
            releaseDate: '13/06/2025'
        },
        {
            id: 6,
            title: 'SUPERMAN',
            poster: 'https://via.placeholder.com/300x450?text=Superman',
            ageRating: 'P',
            duration: '120 phút',
            genre: 'Hành động, Phiêu lưu',
            country: 'Mỹ',
            releaseDate: '11/07/2025'
        },
        {
            id: 7,
            title: 'PHIM XÌ TRUM',
            poster: 'https://via.placeholder.com/300x450?text=Phim+Xi+Trum',
            ageRating: 'P',
            duration: '90 phút',
            genre: 'Hoạt hình, Hài',
            country: 'Mỹ',
            releaseDate: '18/07/2025'
        },
        {
            id: 8,
            title: 'THẾ GIỚI KHỦNG LONG: TÁI SINH',
            poster: 'https://via.placeholder.com/300x450?text=The+Gioi+Khung+Long',
            ageRating: 'P',
            duration: '130 phút',
            genre: 'Hành động, Khoa học viễn tưởng',
            country: 'Mỹ',
            releaseDate: '04/07/2025'
        }
    ];

    const promotions = [
        {
            id: 1,
            title: 'Chương trình tặng quà nhân dịp mùng 8 tháng 3 !!!',
            image: 'https://via.placeholder.com/400x200?text=8+3',
            date: '04/03/2025'
        },
        {
            id: 2,
            title: 'GÀ RÁN SIÊU MÊ LY ĐỒNG GIÁ CHỈ 79K CÁC SET GÀ RÁN',
            image: 'https://via.placeholder.com/400x200?text=Ga+Ran',
            date: '31/01/2025'
        },
        {
            id: 3,
            title: 'TƯNG BỪNG ƯU ĐÃI năm 2025 tại Trung tâm Chiếu phim Quốc gia',
            image: 'https://via.placeholder.com/400x200?text=Uu+Dai+2025',
            date: '31/12/2024'
        }
    ];

    const { data: movieData, error: movieError } = useSWR(
        'movies',
        () => movieService().index({}),
        { shouldRetryOnError: false }
    );
    const movies = movieData?.data?.filter(movie => movie.status == 1) || [];

    return (
        <Layout>
            <Header className={`${styles.header} ${isScrolled ? styles.blur : ''}`}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <img src="/logo/logo.png" alt="Logo" />
                    </div>
                    <nav className={styles.nav}>
                        <a
                            href="/"
                            className={activeLink === '/' ? styles.active : ''}
                        >Trang chủ</a>
                        <a
                            href="/lich-chieu"
                            className={activeLink === '/lich-chieu' ? styles.active : ''}
                        >Lịch chiếu</a>
                        <a
                            href="/tin-tuc"
                            className={activeLink === '/tin-tuc' ? styles.active : ''}
                        >Tin tức</a>
                        <a
                            href="/khuyen-mai"
                            className={activeLink === '/khuyen-mai' ? styles.active : ''}
                        >Khuyến mãi</a>
                        <a
                            href="/gia-ve"
                            className={activeLink === '/gia-ve' ? styles.active : ''}
                        >Giá vé</a>
                        <a
                            href="/gioi-thieu"
                            className={activeLink === '/gioi-thieu' ? styles.active : ''}
                        >Giới thiệu</a>
                        {isLoggedIn && (
                            <a
                                onClick={() => redirect("frontend.admin.dashboard.index")}
                                className={activeLink === '/admin/dashboard' ? styles.active : ''}
                            >Quản lý</a>
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

            <Content className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.banner}>
                        <Carousel autoplay>
                            {movies.length > 0 ? (
                                movies
                                    .filter(movie => !!movie.banner)
                                    .map((movie) => (
                                        <div key={movie.id} onClick={() => router.push(`/home/${movie.id}`)} style={{ cursor: 'pointer' }}>
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3333'}${movie.banner}`}
                                                alt={movie.title}
                                                style={{ width: '100%', height: 'auto', objectFit: 'unset', display: 'block', background: '#000' }}
                                            />
                                        </div>
                                    ))
                            ) : (
                                <div>
                                    <img src="/default-banner.jpg" alt="Default Banner" style={{ width: '100%', height: 'auto', objectFit: 'unset', display: 'block', background: '#000' }} />
                                </div>
                            )}
                        </Carousel>
                    </div>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.nowShowingTitle}>
                                <span className={styles.dot}></span>
                                <span>Phim đang chiếu</span>
                            </div>
                            <a className={styles.viewAll} href="/lich-chieu">Xem tất cả</a>
                        </div>
                        <div className={styles.movieGrid}>
                            {movies.length === 0 && <p>Không có phim đang chiếu.</p>}
                            {movies.map(movie => (
                                <div key={movie.id} className={styles.movieCard} onClick={() => router.push(`/home/${movie.id}`)} style={{ cursor: 'pointer' }}>
                                    <img className={styles.poster} src={movie.image ? `${process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3333'}${movie.image}` : '/no-image.png'} alt={movie.title} />
                                    <div className={styles.metaTop}>
                                        <span className={styles.genre}>{movie.genre}</span>
                                        <span className={styles.releaseDate}>{movie.realeaseDate ? new Date(movie.realeaseDate).toLocaleDateString('vi-VN') : ''}</span>
                                    </div>
                                    <div className={styles.title}>{movie.title?.toUpperCase()}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>PHIM SẮP CHIẾU</h2>
                            <span className={styles.viewAll}>
                                Xem tất cả <RightOutlined />
                            </span>
                        </div>
                        <div className={styles.movieGrid}>
                            {upcomingMovies.map(movie => (
                                <div key={movie.id} className={styles.movieCard}>
                                    <div className={styles.poster}>
                                        <img src={movie.poster} alt={movie.title} />
                                        <span className={styles.ageRating}>{movie.ageRating}</span>
                                    </div>
                                    <div className={styles.info}>
                                        <h3 className={styles.title}>{movie.title}</h3>
                                        <div className={styles.meta}>
                                            <p>{movie.genre} • {movie.duration}</p>
                                            <p>{movie.country}</p>
                                            <p>Khởi chiếu: {movie.releaseDate}</p>
                                        </div>
                                        <Button type="primary" className={styles.button}>
                                            Mua vé ngay
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>KHUYẾN MÃI</h2>
                            <span className={styles.viewAll}>
                                Xem tất cả <RightOutlined />
                            </span>
                        </div>
                        <div className={styles.promotionGrid}>
                            {promotions.map(promotion => (
                                <div key={promotion.id} className={styles.promotionCard}>
                                    <img src={promotion.image} alt={promotion.title} />
                                    <div className={styles.content}>
                                        <h3 className={styles.title}>{promotion.title}</h3>
                                        <p className={styles.date}>{promotion.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </Content>

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
        </Layout>
    );
};

Home.Layout = (props) => {
    const { t } = useBaseHook();

    return <Layout
        title={t('pages:home.title')}
        description={t('pages:home.description')}
        {...props}
    />
}

export default Home;