import React from 'react';
import { Modal, Form, Input, Button, Row, Col, DatePicker } from 'antd';
import styles from '../../scss/auth/RegisterModal.module.scss';
import authService from '@src/services/authService';
import { message } from 'antd';

interface RegisterModalProps {
    visible: boolean;
    onCancel: () => void;
    onLoginClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ visible, onCancel, onLoginClick }) => {
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        try {
            await authService().register({
                name: values.fullName,
                username: values.username,
                email: values.email,
                password: values.password,
                phoneNumber: values.phoneNumber,
                birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : undefined
            });
            message.success('Đăng ký thành công!');
            onCancel();
        } catch (err: any) {
            message.error(err?.message || 'Đăng ký thất bại!');
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            className={`${styles.modalContainer} ${styles.registerModalOverride}`}
            closable
            centered
            title={null}
        >
            <div className={styles.title}>Đăng ký</div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ remember: true }}
            >
                <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập Họ và tên!' }]}>
                    <Input placeholder="Họ và tên" />
                </Form.Item>

                <Form.Item
                    label="Tên tài khoản"
                    name="username"
                    rules={[{ required: true, message: 'Vui lòng nhập Tên tài khoản!' }]}>
                    <Input placeholder="Tên tài khoản" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Số điện thoại"
                            name="phoneNumber"
                            rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}
                        >
                            <Input placeholder="Số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng nhập Email!', type: 'email' }]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    label="Ngày sinh"
                    name="birthday"
                    rules={[{ required: true, message: 'Vui lòng chọn Ngày sinh!' }]}
                    className={styles.input + ' ' + styles.labelCustom}
                >
                    <DatePicker
                        style={{
                            width: '100%',
                            background: '#232733',
                            color: '#fff',
                            borderRadius: 12,
                            border: '1px solid #232733',
                            fontSize: '1rem',
                            padding: '10px 16px',
                        }}
                        format="DD-MM-YYYY"
                        inputReadOnly={false}
                    />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}>
                    <Input.Password placeholder="Mật khẩu" />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận Mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}>
                    <Input.Password placeholder="Xác nhận mật khẩu" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Đăng ký
                    </Button>
                </Form.Item>

                <div className={styles.footer}>
                    Bạn đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick(); }}>Đăng nhập</a>
                </div>
            </Form>
        </Modal>
    );
};

export default RegisterModal; 