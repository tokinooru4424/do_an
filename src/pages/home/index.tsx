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

    const user = auth().user;
    const menu = (
        <Menu>
            <Menu.Item key="profile">
                Thông tin cá nhân
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    const movies = [
        {
            id: 1,
            title: 'PHIM ĐIỆN ẢNH DORAEMON: NOBITA VÀ CUỘC PHIÊU LƯU VÀO THẾ GIỚI TRONG TRANH',
            poster: 'https://via.placeholder.com/300x450?text=Doraemon',
            ageRating: 'P',
            duration: '105 phút',
            genre: 'Hoạt hình 2D',
            country: 'Nhật Bản',
            releaseDate: '23/05/2025'
        },
        {
            id: 2,
            title: 'UNTIL DAWN: BÍ MẬT KINH HOÀNG',
            poster: 'https://via.placeholder.com/300x450?text=Until+Dawn',
            ageRating: 'T18',
            duration: '104 phút',
            genre: 'Kinh dị 2D',
            country: 'Mỹ',
            releaseDate: '16/05/2025'
        },
        {
            id: 3,
            title: 'YADANG: BA MẶT LẬT KÈO',
            poster: 'https://via.placeholder.com/300x450?text=Yadang',
            ageRating: 'T18',
            duration: '122 phút',
            genre: 'Hành động 2D',
            country: 'Hàn Quốc',
            releaseDate: '23/05/2025'
        },
        {
            id: 4,
            title: 'MA MÓC HỌNG',
            poster: 'https://via.placeholder.com/300x450?text=Ma+Moc+Hong',
            ageRating: 'T16',
            duration: '110 phút',
            genre: 'Kinh dị',
            country: 'Việt Nam',
            releaseDate: '23/05/2025'
        }
    ];

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

    return (
        <Layout>
            <Header className={`${styles.header} ${isScrolled ? styles.blur : ''}`}>
                <div className={styles.headerContent}>
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
                            <div>
                                <img src="https://www.themoviedb.org/t/p/original/qWnmJb0gV4r6oJd7K8eZk8V0y4V.jpg" alt="Fake Movie Banner 1" />
                            </div>
                            <div>
                                <img src="https://www.themoviedb.org/t/p/original/xS32JdFKs2QYjKVAaL9sN4TgcG2.jpg" alt="Fake Movie Banner 2" />
                            </div>
                            <div>
                                <img src="https://www.themoviedb.org/t/p/original/vPZsdp3Zg8NfIuU8N10F3K1Xm0z.jpg" alt="Fake Movie Banner 3" />
                            </div>
                        </Carousel>
                    </div>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>PHIM ĐANG CHIẾU</h2>
                            <span className={styles.viewAll}>
                                Xem tất cả <RightOutlined />
                            </span>
                        </div>
                        <div className={styles.movieGrid}>
                            {movies.map(movie => (
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