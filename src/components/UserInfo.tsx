import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Button, Modal, Form, Input, Radio, DatePicker, message } from 'antd';
import UserService from '@src/services/userService';
import constant from '@config/constant';
import moment from 'moment';

const UserInfo = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm] = Form.useForm();

  const fetchUser = () => {
    setLoading(true);
    UserService().withAuth().getInfo({}).then(res => {
      setUser(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleEdit = () => {
    const initialValues = {
      name: user.name,
      phoneNumber: user.phoneNumber,
      gender: user.gender !== undefined ? Number(user.gender) : undefined,
      birthday: user.birthday ? moment(user.birthday) : null,
    };
    console.log('initialValues for edit form:', initialValues);
    editForm.setFieldsValue(initialValues);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values: any) => {
    const payload = {
      ...values,
      gender: Number(values.gender), // Ép kiểu về number
      birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined,
    };
    try {
      // Gọi API cập nhật thông tin user ở đây (giả sử có hàm updateInfo)
      await UserService().withAuth().updateInfo(payload);
      message.success('Cập nhật thành công!');
      setShowEditModal(false);
      fetchUser();
    } catch (err: any) {
      message.error(err?.message || 'Cập nhật thất bại!');
    }
  };

  if (loading) {
    return (
      <Card bordered={false} style={{ background: 'rgba(30,32,36,0.98)', color: '#fff', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 0 }}>
        <Spin style={{ color: '#fff' }} /> Đang tải thông tin cá nhân...
      </Card>
    );
  }

  if (!user) {
    return (
      <Card bordered={false} style={{ background: 'rgba(30,32,36,0.98)', color: '#fff', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 0 }}>
        Không tìm thấy thông tin người dùng.
      </Card>
    );
  }

  return (
    <Card
      bordered={false}
      style={{ background: 'rgba(30,32,36,0.98)', color: '#fff', borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 0 }}
    >
      <Descriptions column={1} labelStyle={{ color: '#fff', fontWeight: 600 }} contentStyle={{ color: '#fff', fontWeight: 700 }}>
        <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
        <Descriptions.Item label="Họ tên">{user.name || user.fullName}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{user.phoneNumber}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">{constant.gender[String(user.gender)]}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">{user.birthday ? moment(user.birthday).format('DD/MM/YYYY') : ''}</Descriptions.Item>
      </Descriptions>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button type="primary" onClick={handleEdit}>
          Sửa thông tin cá nhân
        </Button>
      </div>
      <Modal
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        title={<span style={{ color: '#fff' }}>Sửa thông tin cá nhân</span>}
        bodyStyle={{ background: '#181b20', color: '#fff' }}
        style={{ top: 40 }}
        className="custom-dark-modal"
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{
            name: user.name,
            phoneNumber: user.phoneNumber,
            gender: user.gender !== undefined ? Number(user.gender) : undefined,
            birthday: user.birthday ? moment(user.birthday) : null,
          }}
          onFinish={handleEditSubmit}
        >
          <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
            <Radio.Group>
              <Radio value={0}>Nam</Radio>
              <Radio value={1}>Nữ</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Ngày sinh" name="birthday">
            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
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
          .custom-dark-modal .ant-form-item-label > label,
          .custom-dark-modal .ant-form-item-label,
          .custom-dark-modal .ant-form-item-required,
          .custom-dark-modal .ant-radio-wrapper,
          .custom-dark-modal .ant-picker,
          .custom-dark-modal .ant-input,
          .custom-dark-modal .ant-radio-inner,
          .custom-dark-modal .ant-form-item-explain-error {
            color: #fff !important;
            background: transparent !important;
          }
          .custom-dark-modal .ant-input,
          .custom-dark-modal .ant-picker {
            background: #232733 !important;
            border: 1px solid #232733 !important;
          }
        `}</style>
      </Modal>
    </Card>
  );
};

export default UserInfo; 