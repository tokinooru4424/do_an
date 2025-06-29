import React from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'antd';
import styles from '../../scss/auth/RegisterModal.module.scss';

interface RegisterModalProps {
    visible: boolean;
    onCancel: () => void;
    onLoginClick: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ visible, onCancel, onLoginClick }) => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
        onCancel();
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
                            rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}>
                            <Input placeholder="Số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Vui lòng nhập Email!', type: 'email' }]}>
                            <Input placeholder="Email" />
                        </Form.Item>
                    </Col>
                </Row>

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