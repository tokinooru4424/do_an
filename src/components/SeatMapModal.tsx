import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';

// seatConfig: { totalSeat, seatInRow, seatInColumn }
// seatTypes: { [seatLabel]: 'normal' | 'vip' | 'double' | 'booked' }
const SeatMapModal = ({ visible, onClose, seatConfig, selectedSeats = [], onSelectSeat, seatTypes = {}, startTime, roomName, onPayment }) => {
    if (!seatConfig) return null;
    const { totalSeat, seatInRow, seatInColumn } = seatConfig;
    // Tạo tên ghế: A1, A2, ..., B1, B2, ...
    const getSeatLabel = (rowIdx, colIdx) => {
        const rowChar = String.fromCharCode(65 + rowIdx); // 65 = 'A'
        return `${rowChar}${colIdx + 1}`;
    };

    // Countdown timer (10 phút = 600 giây)
    const [secondsLeft, setSecondsLeft] = useState(600);
    useEffect(() => {
        if (!visible) return;
        setSecondsLeft(600);
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (onClose) onClose();
                    setTimeout(() => alert('Hết thời gian chọn ghế!'), 200);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [visible, onClose]);
    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Tự động đánh dấu ghế VIP nếu chưa có trong seatTypes
    const autoSeatTypes = { ...seatTypes };
    if (totalSeat && seatInRow && seatInColumn) {
        const isBig = totalSeat >= 100;
        const vipRowStart = isBig ? 3 : 2; // bắt đầu từ hàng thứ 4 (index 3) hoặc hàng thứ 3 (index 2)
        const vipRowEnd = seatInColumn - 1; // không lấy hàng cuối
        const vipColStart = isBig ? 2 : 1;
        const vipColEnd = seatInRow - (isBig ? 2 : 1);
        for (let row = vipRowStart; row < vipRowEnd; row++) {
            for (let col = vipColStart; col < vipColEnd; col++) {
                const seatLabel = getSeatLabel(row, col);
                if (!autoSeatTypes[seatLabel]) {
                    autoSeatTypes[seatLabel] = 'vip';
                }
            }
        }
    }

    // Tính tổng tiền ghế đã chọn
    const getSeatPrice = (seatLabel: string) => {
        const type = autoSeatTypes[seatLabel] || 'normal';
        if (type === 'vip') return 80000;
        return 70000;
    };
    const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

    // Render lưới ghế
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            centered
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ fontWeight: 700, fontSize: 22 }}>{startTime ? `Giờ chiếu: ${startTime}` : ''}</span>
                    <span style={{ fontWeight: 600, fontSize: 18, color: '#f44336', background: '#fff', borderRadius: 8, padding: '4px 12px' }}>
                        Thời gian chọn ghế: {formatTime(secondsLeft)}
                    </span>
                </div>
            }
            bodyStyle={{ background: '#fff', borderRadius: 12 }}
        >
            {/* Biểu tượng màn hình */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <div style={{
                    width: 500,
                    height: 48,
                    background: 'linear-gradient(180deg, #ffc107 60%, #ff9800 100%)',
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    boxShadow: '0 8px 32px 0 rgba(255,193,7,0.15)',
                    margin: '0 auto',
                }} />
            </div>
            {/* Tên phòng chiếu */}
            {roomName && (
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, marginBottom: 24, color: '#181b20' }}>
                    {roomName}
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 0 }}>
                {Array.from({ length: seatInColumn }).map((_, rowIdx) => (
                    <div key={rowIdx} style={{ display: 'flex', gap: 8 }}>
                        {Array.from({ length: seatInRow }).map((_, colIdx) => {
                            const seatLabel = getSeatLabel(rowIdx, colIdx);
                            let bg = '#23272f', color = '#fff', border = '2px solid #23272f';
                            let content: React.ReactNode = seatLabel;
                            const type = autoSeatTypes[seatLabel] || 'normal';
                            if (type === 'booked') {
                                bg = '#444'; color = '#fff';
                                content = <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: '48px' }}>×</span>;
                            }
                            else if (type === 'double') { bg = '#f44'; color = '#fff'; }
                            else if (type === 'vip') { bg = '#ffa726'; color = '#fff'; }
                            else { bg = '#23272f'; color = '#fff'; }
                            if (selectedSeats.includes(seatLabel)) { bg = '#2196f3'; color = '#fff'; border = '2px solid #2196f3'; }
                            return (
                                <Button
                                    key={seatLabel}
                                    disabled={type === 'booked'}
                                    style={{
                                        width: 48, height: 48, fontWeight: 600, fontSize: 16, borderRadius: 8,
                                        background: bg, color, border, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    onClick={() => onSelectSeat && onSelectSeat(seatLabel)}
                                >
                                    {content}
                                </Button>
                            );
                        })}
                    </div>
                ))}
            </div>
            {/* Chú thích màu sắc */}
            <div style={{ display: 'flex', gap: 24, marginTop: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: '#444', width: 24, height: 24, display: 'inline-flex', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: '24px' }}>×</span>
                    </span>
                    <span style={{ color: '#000' }}>Đã đặt</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ background: '#2196f3', width: 24, height: 24, display: 'inline-block', borderRadius: 4 }} /> <span style={{ color: '#000' }}>Ghế bạn chọn</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ background: '#23272f', width: 24, height: 24, display: 'inline-block', borderRadius: 4, border: '2px solid #23272f' }} /> <span style={{ color: '#000' }}>Ghế thường</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ background: '#ffa726', width: 24, height: 24, display: 'inline-block', borderRadius: 4 }} /> <span style={{ color: '#000' }}>Ghế VIP</span></div>
            </div>
            {/* Thông tin ghế đã chọn và thanh toán */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 32,
                background: '#fff',
                borderRadius: 16,
                padding: '24px 32px'
            }}>
                <div>
                    <div style={{ color: '#000', fontSize: 18, marginBottom: 4 }}>
                        Ghế đã chọn: {selectedSeats.length > 0 ? selectedSeats.join(', ') : <span style={{ color: '#888' }}>Chưa chọn</span>}
                    </div>
                    <div style={{ color: '#000', fontSize: 18 }}>
                        Tổng tiền: <b>{totalPrice.toLocaleString('vi-VN')}đ</b>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            color: '#000',
                            border: '1px solid #333',
                            borderRadius: 32,
                            fontWeight: 600,
                            fontSize: 18,
                            padding: '0 32px',
                            height: 48
                        }}
                    >
                        Quay lại
                    </Button>
                    <Button
                        type="primary"
                        disabled={selectedSeats.length === 0}
                        style={{
                            background: 'linear-gradient(90deg, #ff3838 0%, #ff5f5f 100%)',
                            border: 'none',
                            borderRadius: 24,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 18,
                            padding: '0 32px',
                            height: 48,
                            opacity: selectedSeats.length === 0 ? 0.7 : 1,
                            transition: 'background 0.3s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ff5f5f 0%, #ff3838 100%)'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #ff3838 0%, #ff5f5f 100%)'}
                        onClick={() => { if (onPayment) onPayment(); }}
                    >
                        Thanh toán
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SeatMapModal; 