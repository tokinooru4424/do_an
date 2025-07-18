import React, { useEffect, useState } from 'react';
import { Card, Table, Modal } from 'antd';
import { HistoryOutlined, CheckCircleTwoTone, EyeOutlined } from '@ant-design/icons';
import TicketService from '@src/services/ticketService';

const columnsBase = [
    { title: <span style={{ fontWeight: 700 }}>Phim</span>, dataIndex: 'movie', key: 'movie' },
    { title: <span style={{ fontWeight: 700 }}>Ngày</span>, dataIndex: 'date', key: 'date' },
    { title: <span style={{ fontWeight: 700 }}>Giờ</span>, dataIndex: 'time', key: 'time' },
    { title: <span style={{ fontWeight: 700 }}>Ghế</span>, dataIndex: 'seats', key: 'seats' },
    { title: <span style={{ fontWeight: 700 }}>Giá</span>, dataIndex: 'price', key: 'price', align: 'right' as const, render: (v) => <span style={{ fontWeight: 700 }}>{v ? Number(v).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : ''}đ</span> },
    { title: <span style={{ fontWeight: 700 }}>Trạng thái</span>, dataIndex: 'status', key: 'status', align: 'center' as const, render: (v) => v === 'Thành công' ? <span style={{ color: '#52c41a', fontWeight: 700 }}><CheckCircleTwoTone twoToneColor="#52c41a" /> {v}</span> : v },
];

const TicketHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleShowDetail = (ticket) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    const fetchData = async () => {
        setLoading(true);
        TicketService().withAuth().getTicketHistory({}).then(res => {
            setHistory(res.tickets || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Thêm cột action vào cuối bảng
    const columns = [
        ...columnsBase,
        {
            title: '',
            key: 'action',
            align: 'center' as const,
            render: (_, record) => (
                <EyeOutlined
                    style={{ color: '#1890ff', fontSize: 18, cursor: 'pointer' }}
                    onClick={() => handleShowDetail(record)}
                />
            ),
        },
    ];

    return (
        <Card bordered={false} style={{ background: 'rgba(30,32,36,0.98)', color: '#fff', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 0 }}>
            {loading ? (
                <div style={{ color: '#fff', textAlign: 'center', padding: 32 }}>Đang tải lịch sử vé...</div>
            ) : history.length === 0 ? (
                <div style={{ color: '#fff', textAlign: 'center', padding: 32 }}>Bạn chưa có vé nào.</div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={history.map((t, idx) => ({
                        ...t,
                        key: t.id || idx,
                        code: t.id, // Mã vé là id
                        movie: t.movieTitle || t.movie?.title || '',
                        date: t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ''),
                        time: t.time || (t.createdAt ? new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''),
                        seats: t.seatNumber,
                        price: t.price,
                        status: t.status || 'Thành công',
                    }))}
                    pagination={false}
                    style={{ background: 'none', color: '#fff', borderRadius: 16 }}
                    rowClassName={(_, idx) => idx % 2 === 0 ? 'custom-row' : 'custom-row-alt'}
                    bordered
                />
            )}
            <Modal
                visible={showDetailModal}
                onCancel={() => setShowDetailModal(false)}
                footer={null}
                bodyStyle={{ background: '#181b20', color: '#fff' }}
                style={{ top: 40 }}
                title={<span style={{ color: '#fff' }}>Chi tiết vé</span>}
                className="custom-dark-modal"
            >
                {selectedTicket && (
                    <div style={{ color: '#fff' }}>
                        <p><b>Mã vé:</b> {selectedTicket.id}</p>
                        <p><b>Phim:</b> {selectedTicket.movieTitle || selectedTicket.movie?.title || ''}</p>
                        <p><b>Ngày:</b> {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString('vi-VN') : ''}</p>
                        <p><b>Giờ:</b> {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                        <p><b>Ghế:</b> {selectedTicket.seatNumber}</p>
                        <p><b>Giá:</b> {selectedTicket.price ? Number(selectedTicket.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : ''}đ</p>
                        <p><b>Trạng thái:</b> {selectedTicket.status || 'Thành công'}</p>
                    </div>
                )}
            </Modal>
            <style jsx global>{`
                .custom-dark-modal .ant-modal-content {
                    background: #181b20 !important;
                    color: #fff !important;
                }
                .custom-dark-modal .ant-modal-header {
                    background: #181b20 !important;
                    color: #fff !important;
                    border-bottom: 1px solid #23262b !important;
                }
                .custom-dark-modal .ant-modal-title {
                    color: #fff !important;
                }
                .custom-dark-modal .ant-modal-close-x {
                    color: #fff !important;
                }
                .custom-dark-modal .ant-modal-footer {
                    background: #181b20 !important;
                    color: #fff !important;
                    border-top: 1px solid #23262b !important;
                }
            `}</style>
        </Card>
    );
};

export default TicketHistory; 