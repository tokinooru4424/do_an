import dynamic from 'next/dynamic'
import useBaseHook from '@src/hooks/BaseHook';
import { Card, Row, Col, Statistic, Select, Typography, Spin } from 'antd';
import { DollarOutlined, ProfileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import useSWR from 'swr';
import dashboardService from '@src/services/dashboardService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })
const { Title } = Typography;

const Dashboard = () => {
  // Lấy dữ liệu thật từ API
  const { data, error } = useSWR('dashboard-summary', () => dashboardService().withAuth().getSummary());
  const loading = !data && !error;

  const totalRevenue = data?.totalRevenue || 0;
  const totalTickets = data?.totalTickets || 0;
  const totalTransactions = data?.totalTransactions || 0;
  const revenueByMonth = data?.revenueByMonth || [];
  const revenueByMovie = data?.revenueByMovie || [];

  const [chartType, setChartType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(revenueByMonth.length > 0 ? revenueByMonth[0].month : '');

  const chartData = chartType === 'month' ? revenueByMonth : revenueByMovie;

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
              formatter={value => Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
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
                options={revenueByMonth.map(item => ({ value: item.month, label: item.month }))}
              />
            )}
          </Col>
        </Row>
        {loading ? <Spin /> : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 16, right: 32, left: 0, bottom: 16 }}
              barSize={48}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartType === 'month' ? 'month' : 'movie'} tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip formatter={value => `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ`} />
              <Legend />
              <Bar dataKey="revenue" fill="#d63384" name="Doanh thu" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
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
