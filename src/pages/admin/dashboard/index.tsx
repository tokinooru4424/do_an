import dynamic from 'next/dynamic'
import useBaseHook from '@src/hooks/BaseHook';
import { Card, Row, Col, Statistic, Select, Typography } from 'antd';
import { DollarOutlined, ProfileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })
const { Title } = Typography;

const mockRevenueByMonth = [
  { month: '1/2024', revenue: 12000000 },
  { month: '2/2024', revenue: 15000000 },
  { month: '3/2024', revenue: 18000000 },
  { month: '4/2024', revenue: 21000000 },
  { month: '5/2024', revenue: 17000000 },
  { month: '6/2024', revenue: 22000000 },
  { month: '7/2024', revenue: 12500000 },
];
const mockRevenueByMovie = [
  { movie: 'Godzilla x Kong', revenue: 32000000 },
  { movie: 'Dune 2', revenue: 25000000 },
  { movie: 'Kungfu Panda 4', revenue: 18000000 },
  { movie: 'Mai', revenue: 15000000 },
  { movie: 'Bí Kíp Luyện Rồng', revenue: 12000000 },
];

const Dashboard = () => {
  // Mock data
  const totalRevenue = 125000000; // 125 triệu
  const totalTickets = 1789;
  const totalTransactions = 1620;

  const [chartType, setChartType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState('7/2024');

  const chartData = chartType === 'month' ? mockRevenueByMonth : mockRevenueByMovie;

  return (
    <div className="content" style={{ padding: 32 }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fffbe6' }}>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#faad14', fontWeight: 700, fontSize: 28 }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#e6f7ff' }}>
            <Statistic
              title="Số vé đã bán"
              value={totalTickets}
              valueStyle={{ color: '#1890ff', fontWeight: 700, fontSize: 28 }}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#f6ffed' }}>
            <Statistic
              title="Giao dịch thành công"
              value={totalTransactions}
              valueStyle={{ color: '#52c41a', fontWeight: 700, fontSize: 28 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 40, borderRadius: 16 }}>
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Title level={4} style={{ margin: 0 }}>Biểu đồ doanh thu</Title>
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <Select
              value={chartType}
              onChange={setChartType}
              style={{ width: 200, marginRight: 16 }}
              options={[
                { value: 'month', label: 'Doanh thu theo tháng' },
                { value: 'movie', label: 'Doanh thu theo phim' },
              ]}
            />
            {chartType === 'month' && (
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 160 }}
                options={mockRevenueByMonth.map(item => ({ value: item.month, label: item.month }))}
              />
            )}
          </Col>
        </Row>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 32, left: 0, bottom: 16 }}
            barSize={48}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartType === 'month' ? 'month' : 'movie'} tick={{ fontSize: 14 }} />
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip formatter={value => `${value.toLocaleString('vi-VN')}đ`} />
            <Legend />
            <Bar dataKey="revenue" fill="#d63384" name="Doanh thu" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

Dashboard.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t('pages:dashboard.index.title')}
    description={t('pages:dashboard.index.description')}
    {...props}
  />
}

Dashboard.permissions = {
  'dashboard': "R",
};

export default Dashboard
