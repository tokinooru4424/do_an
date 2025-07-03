import React, { useEffect, useState } from "react";
import { Form, Input, Row, Col, Select, InputNumber } from "antd";
import useBaseHook from "@src/hooks/BaseHook";
import cinemaService from "@root/src/services/cinemaService";
import useSWR from "swr";
import constant from 'config/constant';

const { TextArea } = Input;
const { Option } = Select;

const HallForm = ({ form, isEdit }: { form: any; isEdit: boolean }) => {
    const { t, getData } = useBaseHook();

    const { data: dataC } = useSWR("cinemaData", () =>
        cinemaService().withAuth().select2({ pageSize: -1 })
    );

    const cinemas = getData(dataC, "data", []);

    return (
        <Row gutter={[24, 0]}>
            <Col md={24}>
                <Form.Item
                    label={t("pages:halls.form.name")}
                    name="name"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:halls.form.name") }) },
                        { whitespace: true, message: t("messages:form.required", { name: t("pages:halls.form.name") }) },
                        { max: 255, message: t("messages:form.maxLength", { name: t("pages:halls.form.name"), length: 255 }) },
                    ]}
                >
                    <Input placeholder={t("pages:halls.form.name")} />
                </Form.Item>
            </Col>

            <Col md={24}>
                <Form.Item
                    label={t("pages:halls.form.cinema")}
                    name="cinemaId"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:halls.form.cinema") }) },
                    ]}
                >
                    <Select
                        placeholder={t("pages:halls.form.cinema")}
                        allowClear
                        showSearch
                    >
                        {cinemas.map((item) => (
                            <Option value={item.value} key={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>

            <Col md={24}>
                <Form.Item
                    label={t("pages:halls.form.description")}
                    name="description"
                    rules={[
                        { max: 1000, message: t("messages:form.maxLength", { name: t("pages:halls.form.description"), length: 1000 }) },
                    ]}
                >
                    <TextArea placeholder={t("pages:halls.form.description")}
                        rows={3}
                    />
                </Form.Item>
            </Col>

            <Col md={8}>
                <Form.Item
                    label={t("pages:halls.form.totalSeat")}
                    name="totalSeat"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:halls.form.totalSeat") }) },
                        { type: 'number', min: 1, message: t("messages:form.number") }
                    ]}
                >
                    <InputNumber min={1} placeholder={t("pages:halls.form.totalSeat")}
                        style={{ width: "100%" }} />
                </Form.Item>
            </Col>
            <Col md={8}>
                <Form.Item
                    label={t("pages:halls.form.seatInRow")}
                    name="seatInRow"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:halls.form.seatInRow") }) },
                        { type: 'number', min: 1, message: t("messages:form.number") }
                    ]}
                >
                    <InputNumber min={1} placeholder={t("pages:halls.form.seatInRow")}
                        style={{ width: "100%" }} />
                </Form.Item>
            </Col>
            <Col md={8}>
                <Form.Item
                    label={t("pages:halls.form.seatInColumn")}
                    name="seatInColumn"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:halls.form.seatInColumn") }) },
                        { type: 'number', min: 1, message: t("messages:form.number") }
                    ]}
                >
                    <InputNumber min={1} placeholder={t("pages:halls.form.seatInColumn")}
                        style={{ width: "100%" }} />
                </Form.Item>
            </Col>

            <Col md={8}>
                <Form.Item
                    label={t("pages:halls.form.format")}
                    name="format"
                    rules={[
                        { required: true, message: t("messages:form.required", { name: t("pages:halls.form.format") }) },
                    ]}
                >
                    <Select placeholder={t("pages:halls.form.format")}>
                        {Object.entries(constant.hallFormat).map(([key, value]) => (
                            <Option value={Number(key)} key={key}>{value}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
        </Row>
    );
};

export default HallForm; 