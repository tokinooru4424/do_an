import React, { useState, useMemo } from 'react';
import { Modal, Button, Spin } from 'antd';
import useSWR from 'swr';
import cinemaService from '@src/services/cinemaService';
import showTimeService from '@src/services/showTimeService';
import SeatMapModal from './SeatMapModal';
import hallService from '@src/services/hallService';
import PaymentPage from '../pages/home/payment';
import { useRouter } from 'next/router';

const mockDates = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
        label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', weekday: 'short' }),
        value: d.toLocaleDateString('en-CA'),
    };
});

const BookingModal = ({ visible, onClose, movieId, movie }) => {
    const [selectedDate, setSelectedDate] = useState(mockDates[0].value);
    const { data: cinemaData, error: cinemaError } = useSWR('cinemaData', () => cinemaService().select2({ pageSize: -1 }));
    const cinemas = cinemaData?.data || [];
    // Lấy tất cả suất chiếu của phim này
    const { data: showtimeData, error: showtimeError } = useSWR(
        movieId ? `showtimes-movie-${movieId}` : null,
        () => showTimeService().index({ movieId })
    );
    const showtimes = showtimeData?.data || [];
    // Lọc suất chiếu theo ngày được chọn
    const filteredShowtimes = useMemo(() => {
        // So sánh ngày local
        console.log('selectedDate (local):', selectedDate);
        showtimes.forEach(st => {
            const dateStr = new Date(st.startTime).toLocaleDateString('en-CA');
            console.log('showtimeId:', st.id, 'startTime:', st.startTime, 'dateStr (local):', dateStr);
        });
        return showtimes.filter(st => {
            if (!st.startTime) return false;
            const dateStr = new Date(st.startTime).toLocaleDateString('en-CA');
            return dateStr === selectedDate;
        });
    }, [showtimes, selectedDate]);
    // Gom suất chiếu theo rạp
    const showtimesByCinema = useMemo(() => {
        const map = {};
        filteredShowtimes.forEach(st => {
            const cinemaId = st.cinemaId || st.cinema?.id;
            if (!cinemaId) return;
            if (!map[cinemaId]) map[cinemaId] = [];
            map[cinemaId].push(st);
        });
        return map;
    }, [filteredShowtimes]);
    const [seatModalOpen, setSeatModalOpen] = useState(false);
    const [selectedHall, setSelectedHall] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loadingHall, setLoadingHall] = useState(false);
    // Fetch halls để lấy thông tin sơ đồ ghế
    const { data: hallData } = useSWR('hallData', () => hallService().select2({ pageSize: -1 }));
    const halls = hallData?.data || [];
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const router = useRouter();

    // Khi click vào suất chiếu
    const handleShowtimeClick = (showtime) => {
        // Lấy hall từ danh sách halls (giả sử hall.value là id)
        const hall = halls.find(h => Number(h.value) === Number(showtime.hallId) || Number(h.id) === Number(showtime.hallId));
        setSelectedHall(hall);
        setSelectedShowtime(showtime);
        setSeatModalOpen(true);
    };

    // Tính tổng tiền ghế đã chọn (giống logic ở SeatMapModal)
    const getSeatPrice = (seatLabel) => {
        const type = (selectedHall && selectedHall.autoSeatTypes && selectedHall.autoSeatTypes[seatLabel]) || 'normal';
        if (type === 'vip') return 80000;
        return 70000;
    };
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
            title={<div style={{ fontWeight: 700, fontSize: 22 }}>Chọn suất chiếu</div>}
            bodyStyle={{ background: '#f8f6ea', borderRadius: 12 }}
        >
            {/* Chọn ngày */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24 }}>
                {mockDates.map(date => (
                    <Button
                        key={date.value}
                        type={selectedDate === date.value ? 'primary' : 'default'}
                        style={{ minWidth: 60, height: 60, fontWeight: 600, fontSize: 16, borderRadius: 8, background: selectedDate === date.value ? '#222' : '#fff', color: selectedDate === date.value ? '#fff' : '#222', border: selectedDate === date.value ? '2px solid #222' : undefined }}
                        onClick={() => setSelectedDate(date.value)}
                    >
                        <div>{date.label.split(',')[0]}</div>
                        <div style={{ fontSize: 13 }}>{date.label.split(',')[1]}</div>
                    </Button>
                ))}
            </div>
            {/* Danh sách rạp và suất chiếu */}
            <div style={{ marginTop: 16 }}>
                {!cinemaData && !cinemaError ? <Spin /> : cinemaError ? <div>Không thể tải danh sách rạp.</div> : (
                    cinemas.length === 0 ? <div>Không có rạp nào.</div> : (
                        cinemas.map((cinema, idx) => {
                            const cinemaId = cinema.value || cinema.id;
                            const showtimesForCinema = showtimesByCinema[cinemaId] || [];
                            return (
                                <div key={cinemaId} style={{ marginBottom: 32 }}>
                                    <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{cinema.label || cinema.name}</div>
                                    <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>{cinema.format || 'Rạp 2D'}</div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {showtimesForCinema.length === 0 ? <span style={{ color: '#888' }}>Không có suất chiếu</span> : (
                                            showtimesForCinema.map(st => (
                                                <Button key={st.id} style={{ minWidth: 100, height: 40, fontWeight: 600, fontSize: 16, background: '#fff', border: '1px solid #ccc' }}
                                                    onClick={() => handleShowtimeClick(st)}
                                                >
                                                    {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </Button>
                                            ))
                                        )}
                                    </div>
                                    {idx < cinemas.length - 1 && <hr style={{ margin: '24px 0', border: 'none', borderTop: '2px solid #222' }} />}
                                </div>
                            );
                        })
                    )
                )}
            </div>
            {/* Modal chọn ghế */}
            <SeatMapModal
                visible={seatModalOpen}
                onClose={() => setSeatModalOpen(false)}
                seatConfig={selectedHall && {
                    totalSeat: selectedHall.totalSeat,
                    seatInRow: selectedHall.seatInRow,
                    seatInColumn: selectedHall.seatInColumn,
                }}
                selectedSeats={selectedSeats}
                onSelectSeat={(seatNum) => {
                    setSelectedSeats(prev =>
                        prev.includes(seatNum)
                            ? prev.filter(s => s !== seatNum)
                            : [...prev, seatNum]
                    );
                }}
                startTime={selectedShowtime ? new Date(selectedShowtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                roomName={selectedHall?.name || selectedHall?.label || ''}
                onPayment={() => {
                    // Sinh lại autoSeatTypes giống logic ở SeatMapModal
                    let autoSeatTypes = {};
                    if (selectedHall && selectedHall.totalSeat && selectedHall.seatInRow && selectedHall.seatInColumn) {
                        const totalSeat = selectedHall.totalSeat;
                        const seatInRow = selectedHall.seatInRow;
                        const seatInColumn = selectedHall.seatInColumn;
                        const isBig = totalSeat >= 100;
                        const vipRowStart = isBig ? 3 : 2;
                        const vipRowEnd = seatInColumn - 1;
                        const vipColStart = isBig ? 2 : 1;
                        const vipColEnd = seatInRow - (isBig ? 2 : 1);
                        const getSeatLabel = (rowIdx, colIdx) => {
                            const rowChar = String.fromCharCode(65 + rowIdx);
                            return `${rowChar}${colIdx + 1}`;
                        };
                        for (let row = vipRowStart; row < vipRowEnd; row++) {
                            for (let col = vipColStart; col < vipColEnd; col++) {
                                const seatLabel = getSeatLabel(row, col);
                                autoSeatTypes[seatLabel] = 'vip';
                            }
                        }
                    }
                    // Mapping từng ghế đã chọn
                    const seatTypes = {};
                    selectedSeats.forEach(seat => {
                        seatTypes[seat] = autoSeatTypes[seat] || 'normal';
                    });

                    // TÍNH LẠI TỔNG TIỀN DỰA TRÊN seatTypes
                    const totalPrice = selectedSeats.reduce((sum, seat) => {
                        const type = seatTypes[seat];
                        const price = type === 'vip' ? 80000 : 70000;
                        return sum + price;
                    }, 0);

                    const paymentData = {
                        selectedSeats,
                        seatTypes, // <-- Đảm bảo không bị rỗng và đúng loại ghế!
                        movie,
                        showtime: selectedShowtime,
                        cinema: cinemas.find(c => (c.value || c.id) === (selectedShowtime?.cinemaId || selectedShowtime?.cinema?.id)) || {},
                        hall: selectedHall || {},
                        totalPrice, // <-- Đảm bảo luôn đúng!
                    };
                    localStorage.setItem('paymentData', JSON.stringify(paymentData));

                    // Đảm bảo movieId, showtimeId, hallId là số hợp lệ
                    console.log('DEBUG:', { movieId, selectedShowtime, selectedHall });
                    console.log('movieId:', movieId, 'selectedShowtime?.id:', selectedShowtime?.id, 'selectedHall?.id:', selectedHall?.id);
                    const movieIdNum = Number(movieId);
                    const showtimeIdNum = Number(selectedShowtime?.id);
                    const hallIdNum = Number(selectedHall?.value); // Sửa ở đây: dùng value thay cho id
                    if (
                        isNaN(movieIdNum) || movieIdNum <= 0 ||
                        isNaN(showtimeIdNum) || showtimeIdNum <= 0 ||
                        isNaN(hallIdNum) || hallIdNum <= 0
                    ) {
                        alert('Không xác định được thông tin phim, suất chiếu hoặc phòng chiếu!');
                        return;
                    }
                    router.push({
                        pathname: '/home/payment',
                        query: {
                            movieId: movieIdNum,
                            showtimeId: showtimeIdNum,
                            hallId: hallIdNum,
                        }
                    });
                    onClose();
                }}
            />
            {selectedHall && <pre style={{ color: 'red' }}>selectedHall: {JSON.stringify(selectedHall, null, 2)}</pre>}
        </Modal>
    );
};

export default BookingModal; 