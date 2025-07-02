import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import useBaseHook from "@src/hooks/BaseHook";
import to from 'await-to-js';
import cinemaService from '@root/src/services/cinemaService';
import { Row, Col, Card, Spin, Descriptions, Button } from "antd";
import { LeftCircleFilled } from '@ant-design/icons';
import moment from "moment";

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const CinemaInfo = ({ cinemaData }) => {
  if (!cinemaData) return <Spin />;
  return (
    <Card title="Thông tin rạp chiếu phim" bordered={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="Tên rạp">{cinemaData.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{cinemaData.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{cinemaData.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{cinemaData.address}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{cinemaData.description || "Không có mô tả"}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{cinemaData.createdAt ? moment(cinemaData.createdAt).format("DD/MM/YYYY HH:mm") : ""}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

const View = () => {
  const { t, notify, router } = useBaseHook();
  const { query } = router;
  const [loading, setLoading] = useState(false);
  const [cinema, setCinema] = useState<Cinema | undefined>();

  const fetchData = async () => {
    if (!query.id) {
      notify(t('errors:9996'), '', 'error');
      return;
    }
    setLoading(true);
    const [cinemaError, cinemaData]: [any, Cinema] = await to(
      cinemaService().withAuth().detail({ id: query.id })
    );
    setLoading(false);
    if (cinemaError) {
      notify(t(`errors:${cinemaError.code}`), '', 'error');
      return;
    }
    setCinema(cinemaData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="content">
      <Row>
        <Col md={{ span: 24 }}>
          <CinemaInfo cinemaData={cinema} />
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
      title={t("pages:cinemas.view.title")}
      description={t("pages:cinemas.view.description")}
      {...props}
    />
  );
};

View.permissions = {
  "cinemas": "R"
}

export default View;