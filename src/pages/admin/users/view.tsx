import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";
import useBaseHook from "@src/hooks/BaseHook";
import to from 'await-to-js';
import userService from '@root/src/services/userService';
import { Row, Col, Card, Spin, Descriptions, Button } from "antd";
import { LeftCircleFilled } from '@ant-design/icons';
import moment from "moment";

const Layout = dynamic(() => import("@src/layouts/Admin"), { ssr: false });

const UserInfo = ({ userData }) => {
  if (!userData) return <Spin />;
  return (
    <Card title="Thông tin người dùng" bordered={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="Họ tên">{userData.name}</Descriptions.Item>
        <Descriptions.Item label="Tên tài khoản">{userData.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{userData.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{userData.birthday ? moment(userData.birthday).format("DD/MM/YYYY") : ""}</Descriptions.Item>
        <Descriptions.Item label="Vai trò">{userData.role}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{userData.createdAt ? moment(userData.createdAt).format("DD/MM/YYYY") : ""}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

const View = () => {
  const { t, notify, router } = useBaseHook();
  const { query } = router;
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<User | undefined>();

  const fetchData = async () => {
    if (!query.id) {
      notify(t('errors:9996'), '', 'error');
      return;
    }
    setLoading(true);
    const [adminError, adminData]: [any, User] = await to(
      userService().withAuth().detail({ id: query.id })
    );
    setLoading(false);
    if (adminError) {
      notify(t(`errors:${adminError.code}`), '', 'error');
      return;
    }
    setAdmin(adminData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="content">
      <Row>
        <Col md={{ span: 24 }}>
          <UserInfo userData={admin} />
          <div className="text-center" style={{ marginTop: 24 }}>
            <Button onClick={() => router.back()}>
              <LeftCircleFilled /> Quay lại
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
      title={t("pages:users.view.title")}
      description={t("pages:users.view.description")}
      {...props}
    />
  );
};

export default View;