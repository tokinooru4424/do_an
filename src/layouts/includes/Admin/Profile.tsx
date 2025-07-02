import React from 'react';
import { Row, Col, Divider } from 'antd';
import useBaseHook from '@src/hooks/BaseHook';

const Profile = () => {
  const { redirect } = useBaseHook();

  const handleLogoClick = () => {
    redirect('/');
  };

  return <div className="sidebar-profile">
    <Row>
      <div className="profile-avatar" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src="/logo/logo.png" className="avatar" />
      </div>
    </Row>
    <Row>
      <Col xs={22} offset={1}>
        <Divider className="profile-endLine" />
      </Col>
    </Row>
  </div>
}

export default Profile