import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import styles from '../../scss/auth/ForgotPasswordModal.module.scss'; // Updated import path

interface ForgotPasswordModalProps {
    visible: boolean;
    onCancel: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ visible, onCancel }) => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
        // Handle forgot password logic here
        onCancel(); // Close modal after submission
    };

    return (
        <Modal
            title="Quên mật khẩu"
            open={visible}
            onCancel={onCancel}
            footer={null} // Hide default footer buttons
            className={`${styles.modalContainer} ${styles.forgotPasswordModalOverride}`} // Apply both container and override classes
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
                    <Input placeholder="Email" className={styles.input} /> {/* Apply input style */}
                </Form.Item>

                <Form.Item className={styles.button}> {/* Apply button style */}
                    <Button type="primary" htmlType="submit" block>
                        Xác nhận
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ForgotPasswordModal;