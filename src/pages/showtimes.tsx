import React, { useState, useMemo } from 'react';
import { Card, Button, Typography, Tag, Spin } from 'antd';
import useSWR from 'swr';
import movieService from '@src/services/movieService';
import showTimeService from '@src/services/showTimeService';
import moment from 'moment';
import MainHeader from '@src/components/Layout/MainHeader';
import constant from '@config/constant';
import cinemaService from '@src/services/cinemaService';
import SeatMapModal from '@src/components/SeatMapModal';
import { useRouter } from 'next/router';
import hallService from '@src/services/hallService';

const { Title } = Typography;

// Tạo danh sách ngày
const getDates = () => {
  const arr = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    arr.push({
      label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      value: `${yyyy}-${mm}-${dd}`, // <-- phải là YYYY-MM-DD
    });
  }
  return arr;
};

const ShowtimesPage = () => {
  const dates = useMemo(getDates, []);
  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const router = useRouter();

  // Lấy danh sách phim đang chiếu
  const { data: moviesData, error: moviesError } = useSWR('movies', () => movieService().index({ status: 1 }));
  const movies = moviesData?.data || [];

  // Lấy tất cả suất chiếu
  const { data: showtimesData, error: showtimesError } = useSWR('showtimes', () => showTimeService().index({}));
  const showtimes = showtimesData?.data || [];

  const { data: cinemasData } = useSWR('cinemas', () => cinemaService().select2({ pageSize: -1 }));
  const cinemas = cinemasData?.data || [];

  const { data: hallsData } = useSWR('halls', () => hallService().select2({ pageSize: -1 }));
  const halls = hallsData?.data || [];

  if (!moviesData || !showtimesData) return <div style={{ color: '#fff', textAlign: 'center', padding: 64 }}><Spin /> Đang tải dữ liệu...</div>;

  return (
    <div style={{ background: '#181b20', minHeight: '100vh', padding: 32, paddingTop: 96 }}>
      <MainHeader />
      <div style={{ marginTop: 48 }} />
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {dates.map(date => (
          <Button
            key={date.value}
            type={selectedDate === date.value ? 'primary' : 'default'}
            style={{
              minWidth: 120,
              height: 48,
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              margin: '0 8px',
              background: selectedDate === date.value ? '#d63384' : '#23272f',
              color: '#fff',
              border: selectedDate === date.value ? '2px solid #d63384' : 'none'
            }}
            onClick={() => setSelectedDate(date.value)}
          >
            {date.label}
          </Button>
        ))}
      </div>
      <div style={{ color: '#fff', textAlign: 'center', marginBottom: 16 }}>
        <Tag color="red" style={{ fontSize: 16, padding: '4px 16px' }}>
          Lưu ý: Khán giả dưới 13 tuổi chỉ chọn suất chiếu kết thúc trước 22h và dưới 16 tuổi chỉ chọn suất chiếu kết thúc trước 23h.
        </Tag>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 32,
        justifyContent: 'center',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        {movies.map(movie => {
          // Lọc suất chiếu của phim này theo ngày
          const showtimesForMovie = showtimes.filter(st =>
            st.movieId == movie.id &&
            moment(st.startTime).format('YYYY-MM-DD') === selectedDate
          );
          if (showtimesForMovie.length === 0) {
            console.log('Không có suất chiếu cho phim:', movie.title, 'vào ngày:', selectedDate);
            return null;
          }

          // Nhóm suất chiếu theo rạp
          const showtimesByCinema = {};
          showtimesForMovie.forEach(st => {
            const cinemaId = st.cinemaId || st.cinema?.id;
            if (!cinemaId) return;
            if (!showtimesByCinema[cinemaId]) showtimesByCinema[cinemaId] = [];
            showtimesByCinema[cinemaId].push(st);
          });

          return (
            <Card
              key={movie.id}
              style={{
                width: 340,
                background: '#23272f',
                borderRadius: 16,
                color: '#fff',
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)'
              }}
              bodyStyle={{ padding: 20 }}
              cover={
                <img
                  alt={movie.title}
                  src={movie.image ? `${process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3333'}${movie.image}` : '/no-image.png'}
                  style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }}
                />
              }
            >
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{movie.title}</div>
              <div style={{ color: '#aaa', marginBottom: 4 }}>{movie.genre} | {movie.duration} phút</div>
              <div style={{ color: '#aaa', marginBottom: 4 }}>Xuất xứ: {movie.country}</div>
              <div style={{ color: '#aaa', marginBottom: 4 }}>Khởi chiếu: {movie.realeaseDate ? new Date(movie.realeaseDate).toLocaleDateString('vi-VN') : ''}</div>
              <div style={{ marginBottom: 8 }}>
                <Tag color="geekblue">{constant.hallFormat[String(movie.format)] || movie.format || '2D'}</Tag>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Lịch chiếu:</div>
              {Object.entries(showtimesByCinema).map(([cinemaId, sts]) => {
                const cinema = cinemas.find(c => c.id == cinemaId || c.value == cinemaId);
                if (!cinema) return null;
                return (
                  <div key={cinemaId} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, color: '#40a9ff', marginBottom: 4 }}>
                      {cinema.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {(sts as any[]).map(st => (
                        <Button key={st.id} style={{
                          minWidth: 60,
                          height: 36,
                          fontWeight: 600,
                          fontSize: 15,
                          borderRadius: 8,
                          background: '#fff',
                          color: '#222',
                          border: '1px solid #d63384'
                        }}
                          onClick={() => {
                            setSelectedShowtime(st);
                            setSelectedMovie(movie);
                            setSelectedCinema(cinema);
                            // Tìm hall tương ứng
                            const hall = halls.find(h => h.id == st.hallId || h.value == st.hallId);
                            setSelectedHall(hall);
                            setSeatModalOpen(true);
                          }}
                        >
                          {moment(st.startTime).format('HH:mm')}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>
      {/* SeatMapModal */}
      <SeatMapModal
        visible={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        seatConfig={{
          totalSeat: selectedHall?.totalSeat,
          seatInRow: selectedHall?.seatInRow,
          seatInColumn: selectedHall?.seatInColumn,
          showTimeId: selectedShowtime?.id,
        }}
        selectedSeats={selectedSeats}
        onSelectSeat={(seatNum) => {
          setSelectedSeats(prev =>
            prev.includes(seatNum)
              ? prev.filter(s => s !== seatNum)
              : [...prev, seatNum]
          );
        }}
        startTime={selectedShowtime ? moment(selectedShowtime.startTime).format('HH:mm') : ''}
        roomName={selectedHall?.name || ''}
        onPayment={() => {
          // Mapping loại ghế (giống BookingModal)
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
          const seatTypes = {};
          selectedSeats.forEach(seat => {
            seatTypes[seat] = autoSeatTypes[seat] || 'normal';
          });

          const totalPrice = selectedSeats.reduce((sum, seat) => {
            const type = seatTypes[seat];
            const price = type === 'vip' ? 80000 : 70000;
            return sum + price;
          }, 0);

          const paymentData = {
            selectedSeats,
            seatTypes,
            movie: selectedMovie,
            showtime: selectedShowtime,
            cinema: selectedCinema,
            hall: selectedHall,
            totalPrice,
          };
          localStorage.setItem('paymentData', JSON.stringify(paymentData));
          setSeatModalOpen(false);
          router.push({
            pathname: '/home/payment',
            query: {
                movieId: selectedMovie.id,
                showtimeId: selectedShowtime.id,
                hallId: selectedHall.value, // Sử dụng id thay vì value
            }
        });
        }}
      />
    </div>
  );
};

export default ShowtimesPage; 