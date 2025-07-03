import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import useBaseHook from "@src/hooks/BaseHook";
import to from 'await-to-js';
import hallService from '@root/src/services/hallService';
import showTimeService from '@root/src/services/showTimeService';
import constant from 'config/constant';
import { Row, Col, Card, Spin, Descriptions, Button } from "antd";
import { LeftCircleFilled } from '@ant-design/icons';
import moment from "moment";

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const ShowTimeInfo = ({ showTime }) => {
  if (!showTime) return <Spin />;
  return (
    <Card title="Thông tin suất chiếu" bordered={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="Phim">{showTime.movieName}</Descriptions.Item>
        <Descriptions.Item label="Phòng chiếu">{showTime.hallName}</Descriptions.Item>
        <Descriptions.Item label="Thời lượng">{showTime.duration ? showTime.duration + ' phút' : ''}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">{showTime.startTime ? moment(showTime.startTime).format("DD/MM/YYYY HH:mm") : ''}</Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">{showTime.endTime ? moment(showTime.endTime).format("DD/MM/YYYY HH:mm") : ''}</Descriptions.Item>
        <Descriptions.Item label="Định dạng">{constant.hallFormat?.[String(showTime.format)] || showTime.format}</Descriptions.Item>
        <Descriptions.Item label="Ngôn ngữ">{showTime.language}</Descriptions.Item>
        <Descriptions.Item label="Phụ đề">{showTime.subtitle}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{showTime.createdAt ? moment(showTime.createdAt).format("DD/MM/YYYY HH:mm") : ''}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

const View = () => {
  const { t, notify, router } = useBaseHook();
  const { query } = router;
  const [loading, setLoading] = useState(false);
  const [hall, setHall] = useState<Hall | undefined>();
  const [showTime, setShowTime] = useState<any>();

  const fetchData = async () => {
    if (!query.id) {
      notify(t('errors:9996'), '', 'error');
      return;
    }
    setLoading(true);
    const [hallError, hallData]: [any, any] = await to(
      hallService().withAuth().detail({ id: query.id })
    );
    const [error, data]: [any, any] = await to(
      showTimeService().withAuth().detail({ id: query.id })
    );
    setLoading(false);
    if (hallError) {
      notify(t(`errors:${hallError.code}`), '', 'error');
      return;
    }
    if (error) {
      notify(t(`errors:${error.code}`), '', 'error');
      return;
    }
    setHall(hallData);
    setShowTime(data);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="content">
      <Row>
        <Col md={{ span: 24 }}>
          <ShowTimeInfo showTime={showTime} />
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