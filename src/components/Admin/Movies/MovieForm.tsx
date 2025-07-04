import React from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Upload, Row, Col } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import constant from 'config/constant';
import useBaseHook from '@src/hooks/BaseHook';

const { TextArea } = Input;

const MovieForm = ({ form, isEdit = false }: { form: any; isEdit?: boolean }) => {
    const { t } = useBaseHook();
    // Hàm xử lý giá trị upload trả về cho form
    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };
    return (
        <Row gutter={[24, 0]}>
            <Col md={24}>
                <Form.Item
                    name="title"
                    label={t('pages:movies.form.title')}
                    rules={[{ required: true, message: t('messages:form.required', { name: t('pages:movies.form.title') }) }]}
                >
                    <Input placeholder={t('pages:movies.form.title')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="genre"
                    label={t('pages:movies.form.genre')}
                    rules={[{ required: true, message: t('messages:form.required', { name: t('pages:movies.form.genre') }) }]}
                >
                    <Input placeholder={t('pages:movies.form.genre')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="duration"
                    label={t('pages:movies.form.duration')}
                    rules={[{ required: true, message: t('messages:form.required', { name: t('pages:movies.form.duration') }) }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder={t('pages:movies.form.duration')} addonAfter="phút" />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="director"
                    label={t('pages:movies.form.director')}
                >
                    <Input placeholder={t('pages:movies.form.director')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="cast"
                    label={t('pages:movies.form.cast')}
                >
                    <Input placeholder={t('pages:movies.form.cast')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="format"
                    label={t('pages:movies.form.format')}
                    rules={[{ required: true, message: t('messages:form.required', { name: t('pages:movies.form.format') }) }]}
                >
                    <Select options={Object.entries(constant.hallFormat).map(([value, label]) => ({ value: Number(value), label }))} placeholder={t('pages:movies.form.format')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="country"
                    label={t('pages:movies.form.country')}
                >
                    <Input placeholder={t('pages:movies.form.country')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="description"
                    label={t('pages:movies.form.description')}
                >
                    <TextArea rows={3} placeholder={t('pages:movies.form.description')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="trailer"
                    label={t('pages:movies.form.trailer')}
                >
                    <Input placeholder={t('pages:movies.form.trailer')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="realeaseDate"
                    label={t('pages:movies.form.realeaseDate')}
                    rules={[{ required: true, message: t('messages:form.required', { name: t('pages:movies.form.realeaseDate') }) }]}
                >
                    <DatePicker style={{ width: '100%' }} placeholder={t('pages:movies.form.realeaseDate')} format="DD/MM/YYYY" />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="status"
                    label={t('pages:movies.form.status')}
                    initialValue={1}
                >
                    <Select options={Object.entries(constant.movieStatus).map(([value, label]) => ({ value: Number(value), label }))} placeholder={t('pages:movies.form.status')} />
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="image"
                    label={t('pages:movies.form.image')}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Upload.Dragger
                        name="files"
                        multiple={false}
                        action="/api/v1/upload/poster"
                        listType="picture"
                        accept="image/*"
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Kéo thả hoặc bấm để chọn ảnh</p>
                    </Upload.Dragger>
                </Form.Item>
            </Col>
            <Col md={24}>
                <Form.Item
                    name="banner"
                    label={t('pages:movies.form.banner')}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    <Upload.Dragger
                        name="files"
                        multiple={false}
                        action="/api/v1/upload/banner"
                        listType="picture"
                        accept="image/*"
                        maxCount={1}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Chọn hoặc kéo ảnh banner vào đây</p>
                    </Upload.Dragger>
                </Form.Item>
            </Col>
        </Row>
    );
};

export default MovieForm; 