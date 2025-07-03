import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import useBaseHook from "@src/hooks/BaseHook";
import to from 'await-to-js';
import hallService from '@root/src/services/hallService';
import { Row, Col, Card, Spin, Descriptions, Button } from "antd";
import { LeftCircleFilled } from '@ant-design/icons';
import moment from "moment";
import hallFormat from 'config/constant';

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const HallInfo = ({ hallData }) => {
  if (!hallData) return <Spin />;
  return (
    <Card title="Thông tin phòng chiếu phim" bordered={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="Tên phòng">{hallData.name}</Descriptions.Item>
        <Descriptions.Item label="Rạp">{hallData.cinema_name}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{hallData.description || "Không có mô tả"}</Descriptions.Item>
        <Descriptions.Item label="Định dạng">{hallFormat?.[hallData.format?.toString()] || hallData.format}</Descriptions.Item>
        <Descriptions.Item label="Tổng số ghế">{hallData.totalSeat}</Descriptions.Item>
        <Descriptions.Item label="Số ghế mỗi hàng">{hallData.seatInRow}</Descriptions.Item>
        <Descriptions.Item label="Số hàng ghế">{hallData.seatInColumn}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{hallData.createdAt ? moment(hallData.createdAt).format("DD/MM/YYYY HH:mm") : ""}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

const View = () => {
  const { t, notify, router } = useBaseHook();
  const { query } = router;
  const [loading, setLoading] = useState(false);
  const [hall, setHall] = useState<Hall | undefined>();

  const fetchData = async () => {
    if (!query.id) {
      notify(t('errors:9996'), '', 'error');
      return;
    }
    setLoading(true);
    const [hallError, hallData]: [any, any] = await to(
      hallService().withAuth().detail({ id: query.id })
    );
    setLoading(false);
    if (hallError) {
      notify(t(`errors:${hallError.code}`), '', 'error');
      return;
    }
    setHall(hallData);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="content">
      <Row>
        <Col md={{ span: 24 }}>
          <HallInfo hallData={hall} />
          <div className="text-center" style={{ marginTop: 24 }}>
            <Button onClick={() => router.back()}>
              <LeftCircleFilled /> {t('buttons:back')}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

View.Layout = (props) => {
  const { t } = useBaseHook();
  return (
    <Layout
      title={t("pages:halls.view.title")}
      description={t("pages:halls.view.description")}
      {...props}
    />
  );
};

View.permissions = {
  "halls": "R"
}

export default View;