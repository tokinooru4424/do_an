"use client"
import React, { useEffect, useState } from 'react';
import { Layout, Button, Avatar, Dropdown, Menu, Modal } from 'antd';
import { DownOutlined, UserOutlined, PlayCircleOutlined } from '@ant-design/icons';
import styles from '@src/scss/pages/Home.module.scss';
import { useRouter } from 'next/router';
import useBaseHook from '@src/hooks/BaseHook';
import auth from '@src/helpers/auth';
import useSWR from 'swr';
import movieService from '@src/services/movieService';
import BookingModal from '@src/components/BookingModal';
import RegisterModal from '@src/components/Auth/RegisterModal';
import LoginModal from '@src/components/Auth/LoginModal';
import ForgotPasswordModal from '@src/components/Auth/ForgotPasswordModal';
import MainHeader from '@src/components/Layout/MainHeader';

const { Header } = Layout;

const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

const MovieDetail = () => {
    const { redirect } = useBaseHook();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!auth().token);
    const [trailerVisible, setTrailerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [activeLink, setActiveLink] = useState(router.pathname);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const [movie, setMovie] = useState(null);
    const [youtubeId, setYoutubeId] = useState(null);
    const [showDescModal, setShowDescModal] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        const handleRouteChange = (url) => {
            setActiveLink(url);
        };
        window.addEventListener('scroll', handleScroll);
        router.events?.on?.('routeChangeComplete', handleRouteChange);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            router.events?.off?.('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

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

    // Movie detail logic
    const getData = async (movieIdNum) => {
        setIsLoading(true);
        try {
            const movie = await movieService().detail({ id: movieIdNum });
            setMovie(movie);
            setYoutubeId(movie?.trailer ? getYoutubeId(movie.trailer) : null);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const { movieId } = router.query;
        const movieIdNum = Number(movieId);
        if (!movieId || isNaN(movieIdNum) || movieIdNum <= 0) return;
        getData(movieIdNum);
    }, [router.query]);

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

    if (isLoading) return <div>Đang tải...</div>;
    if (!movie) return <div>Không tìm thấy phim</div>;

    return (
        <>
        <div style={{ background: '#181b20', minHeight: '100vh' }}>
            <MainHeader />
            {/* Banner lớn */}
            {movie?.banner && (
                <div style={{ width: '100%', height: 350, background: '#000', position: 'relative', overflow: 'hidden' }}>
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3333'}${movie.banner}`}
                        alt="Banner"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                    />
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, #181b20 0%, rgba(24,27,32,0.7) 60%, rgba(24,27,32,0.2) 100%)' }} />
                </div>
            )}
            <div className={styles.container} style={{ marginTop: -180, position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
                    <div style={{ minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: 16, overflow: 'hidden', background: '#23272f' }}>
                        <img
                            src={movie.image ? `${process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3333'}${movie.image}` : '/no-image.png'}
                            alt={movie.title}
                            style={{ width: 220, height: 320, objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                    <div style={{ flex: 1, color: '#fff', paddingBottom: 24 }}>
                        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{movie.title}</h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
                            {movie.genre && <span style={{ color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 16 }}>{movie.genre}</span>}
                            {movie.duration && <span style={{ color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 16 }}>{movie.duration} phút</span>}
                            {movie.country && <span style={{ color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 16 }}>{movie.country}</span>}
                            {movie.realeaseDate && <span style={{ color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 16 }}>Khởi chiếu: {new Date(movie.realeaseDate).toLocaleDateString('vi-VN')}</span>}
                        </div>
                        {movie.director && <div style={{ marginBottom: 8 }}><b>Đạo diễn:</b> {movie.director}</div>}
                        {movie.cast && <div style={{ marginBottom: 8 }}><b>Diễn viên:</b> {movie.cast}</div>}
                        {/* Nội dung phim */}
                        <div style={{
  margin: '16px 0 24px 0',
  background: '#23272f',
  borderRadius: 8,
  padding: 16,
  color: '#fff',
  fontSize: 17,
  lineHeight: 1.7,
  position: 'relative',
  minHeight: 80
}}>
  <div
    style={{
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: movie.description && movie.description.length > 0 ? 'pointer' : 'default'
    }}
    onClick={() => {
      if (movie.description && movie.description.length > 0) setShowDescModal(true);
    }}
    title={movie.description}
  >
    {movie.description || 'Đang cập nhật...'}
  </div>
  {movie.description && movie.description.length > 120 && (
    <div
      onClick={() => setShowDescModal(true)}
      style={{
        position: 'absolute',
        right: 16,
        bottom: 12,
        background: 'rgba(35,39,47,0.95)',
        color: '#40a9ff',
        fontWeight: 700,
        cursor: 'pointer',
        padding: '2px 10px',
        borderRadius: 6,
        fontSize: 15,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
      }}
    >
      Xem thêm
    </div>
  )}
</div>
                        {/* Nút xem trailer */}
                        {movie.trailer && (
                            youtubeId ? (
                                <Button icon={<PlayCircleOutlined />} size="large" style={{ marginRight: 16, fontWeight: 600, fontSize: 18, borderRadius: 8, height: 48, minWidth: 160 }} onClick={() => setTrailerVisible(true)}>
                                    Xem trailer
                                </Button>
                            ) : (
                                <Button icon={<PlayCircleOutlined />} size="large" style={{ marginRight: 16, fontWeight: 600, fontSize: 18, borderRadius: 8, height: 48, minWidth: 160 }} onClick={() => window.open(movie.trailer, '_blank')}>
                                    Xem trailer
                                </Button>
                            )
                        )}
                        <Button type="primary" size="large" style={{ fontWeight: 600, fontSize: 18, borderRadius: 8, height: 48, minWidth: 160 }} onClick={() => setShowBookingModal(true)}>Mua vé ngay</Button>
                        <BookingModal visible={showBookingModal} onClose={() => setShowBookingModal(false)} movieId={movie?.id} movie={movie} />
                        {/* Modal trailer */}
                        <Modal
                            open={trailerVisible}
                            onCancel={() => setTrailerVisible(false)}
                            footer={null}
                            width={600}
                            title="Trailer"
                            destroyOnClose
                            centered
                        >
                            {youtubeId && (
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    title="Trailer"
                                    style={{ width: '100%', height: 340, display: 'block', border: 0 }}
                                />
                            )}
                        </Modal>
                        {/* Modal nội dung phim */}
                        <Modal
                            open={showDescModal}
                            onCancel={() => setShowDescModal(false)}
                            footer={null}
                            title="Nội dung phim"
                            width={600}
                        >
                            <div style={{ whiteSpace: 'pre-line', fontSize: 17, color: '#222' }}>
                                {movie.description}
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
            <RegisterModal
                visible={isRegisterModalVisible}
                onCancel={handleRegisterCancel}
                onLoginClick={handleLoginClickFromRegister}
            />
            <LoginModal
                visible={isLoginModalVisible}
                onCancel={handleLoginCancel}
                onRegisterClick={handleRegisterClickFromLogin}
                onForgotPasswordClick={showForgotPasswordModal}
                onLoginSuccess={handleLoginSuccess}
            />
            <ForgotPasswordModal
                visible={isForgotPasswordModalVisible}
                onCancel={handleForgotPasswordCancel}
            />
        </div>
        </>
    );
};

export default MovieDetail; 