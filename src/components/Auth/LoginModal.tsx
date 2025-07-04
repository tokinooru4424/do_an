import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import styles from '../../scss/auth/LoginModal.module.scss';
import authService from '@root/src/services/authService';
import to from 'await-to-js';
import useBaseHook from '@src/hooks/BaseHook';
import auth from '@src/helpers/auth';

interface LoginModalProps {
    visible: boolean;
    onCancel: () => void;
    onRegisterClick: () => void; // Add prop to handle click on "Đăng ký"
    onForgotPasswordClick: () => void; // Add prop to handle click on "Quên mật khẩu?"
    onLoginSuccess?: () => void; // New prop for parent to update login state
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onCancel, onRegisterClick, onForgotPasswordClick, onLoginSuccess }) => {
    const [form] = Form.useForm();
    const { notify, redirect, t } = useBaseHook();
    const [loading, setLoading] = useState(false)

    const onFinish = async (values: any) => {
        console.log('Login attempt with values:', values);
        setLoading(true)

        try {
            console.log('Calling authService.login...');
            let [error, result]: any[] = await to(authService().login(values))
            console.log('Login response:', { error, result });

            setLoading(false)

            if (error) {
                console.error('Login error:', error);
                return notify(t('messages:message.loginFailed'), t(`errors:${error.code}`), 'error')
            }

            console.log('Setting auth data:', result);
            auth().setAuth(result);

            if (onLoginSuccess) onLoginSuccess(); // Call parent callback

            notify(t('messages:message.loginSuccess'))
            redirect('/')

            return result
        } catch (err) {
            console.error('Unexpected error during login:', err);
            setLoading(false);
            notify('Đã xảy ra lỗi không mong muốn', '', 'error');
        }
    }

    return (
        <Modal
            title="Đăng nhập"
            open={visible}
            onCancel={onCancel}
            footer={null} // Hide default footer buttons
            className={`${styles.modalContainer} ${styles.loginModalOverride}`}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ remember: true }}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập Email!', type: 'email' }]}>
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}>
                    <Input.Password placeholder="Mật khẩu" />
                </Form.Item>

                <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); onForgotPasswordClick(); }}>Quên mật khẩu?</a>
                </div>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Đăng nhập
                    </Button>
                </Form.Item>

                <div className={styles.registerLinkText}>
                    Bạn chưa có tài khoản? <a href="#" onClick={onRegisterClick}>Đăng ký</a>
                </div>
            </Form>
        </Modal >
    );
};

export default LoginModal; 