import React from "react";
import { Form, Input, Row, Col } from "antd";
import useBaseHook from "@src/hooks/BaseHook";

const { TextArea } = Input;

const CinemaForm = ({ form, isEdit }: { form: any; isEdit: boolean }) => {
    const { t } = useBaseHook();

    return (
        <Row gutter={[24, 0]}>
            <Col md={24}>
                <Form.Item
                    label={t("pages:cinemas.form.name")}
                    name="name"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:cinemas.form.name") }) },
                        { whitespace: true, message: t("messages:form.required", { name: t("pages:cinemas.form.name") }) },
                        { max: 255, message: t("messages:form.maxLength", { name: t("pages:cinemas.form.name"), length: 255 }) },
                    ]}
                >
                    <Input placeholder={t("pages:cinemas.form.name")} />
                </Form.Item>
            </Col>

            <Col md={24}>
                <Form.Item
                    label={t("pages:cinemas.form.email")}
                    name="email"
                    rules={[
                        { required: true, message: t('messages:form.required', { name: t('pages:cinemas.form.email') }) },
                        { type: 'email', message: t('messages:form.email') },
                        { max: 255, message: t('messages:form.maxLength', { name: t('pages:cinemas.form.email'), length: 255 }) }
                    ]}
                >
                    <Input
                        placeholder={t('pages:cinemas.form.email')}
                        type="email"
                    />
                </Form.Item>
            </Col>

            <Col md={12}>
                <Form.Item
                    label={t("pages:cinemas.form.phoneNumber")}
                    name="phoneNumber"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:cinemas.form.phoneNumber") }) },
                        { pattern: /^\d{10}$/, message: t("messages:form.phoneNumberLength") }
                    ]}
                >
                    <Input
                        placeholder={t("pages:cinemas.form.phoneNumber")}
                        maxLength={10}
                        inputMode="numeric"
                        onChange={e => {
                            const onlyNums = e.target.value.replace(/\D/g, "");
                            if (onlyNums.length <= 10) {
                                e.target.value = onlyNums;
                            } else {
                                e.target.value = onlyNums.slice(0, 10);
                            }
                        }}
                    />
                </Form.Item>
            </Col>

            <Col md={12}>
                <Form.Item
                    label={t("pages:cinemas.form.address")}
                    name="address"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:cinemas.form.address") }) },
                        { whitespace: true, message: t("messages:form.required", { name: t("pages:cinemas.form.address") }) },
                        { max: 500, message: t("messages:form.maxLength", { name: t("pages:cinemas.form.address"), length: 500 }) },
                    ]}
                >
                    <Input placeholder={t("pages:cinemas.form.address")} />
                </Form.Item>
            </Col>

            <Col md={24}>
                <Form.Item
                    label={t("pages:cinemas.form.description")}
                    name="description"
                    rules={[
                        { max: 1000, message: t("messages:form.maxLength", { name: t("pages:cinemas.form.description"), length: 1000 }) },
                    ]}
                >
                    <TextArea
                        placeholder={t("pages:cinemas.form.description")}
                        rows={4}
                    />
                </Form.Item>
            </Col>
        </Row>
    );
};

export default CinemaForm; 