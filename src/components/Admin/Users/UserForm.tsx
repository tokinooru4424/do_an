import React from "react";
import { Form, Input, Row, Col, Select } from "antd";
import { LockOutlined } from "@ant-design/icons";
import useSWR from "swr";

import useBaseHook from "@src/hooks/BaseHook";
import validatorHook from "@src/hooks/ValidatorHook";

import roleService from "@src/services/roleService";

const { Option } = Select;

const UserForm = ({ form, isEdit }: { form: any; isEdit: boolean }) => {
  const { t, getData } = useBaseHook();
  const { validatorRePassword, CustomRegex } = validatorHook();
  const { data: dataT } = useSWR("select2", () =>
    roleService().withAuth().select2({ pageSize: -1 })
  );

  const roles = getData(dataT, "data", []);

  return (
    <Row gutter={[24, 0]}>
      <Col md={24}>
        <Form.Item
          label={t("pages:users.form.username")}
          name="username"
          rules={[
            { required: true, message: t("messages:form.required", { name: t("pages:users.form.username") }) },
            { whitespace: true, message: t("messages:form.required", { name: t("pages:users.form.username") }) },
            CustomRegex({
              length: 6,
              reGex: "^[0-9A-z._](\\w|\\.|_){5,100}$",
              message: t("messages:form.username"),
            }),
          ]}
        >
          <Input
            placeholder={t("pages:users.form.username")}
            readOnly={isEdit}
          />
        </Form.Item>
      </Col>

      {!isEdit ? (
        <>
          <Col md={12}>
            <Form.Item
              label={t("pages:users.form.password")}
              name="password"
              rules={[
                { required: true, message: t("messages:form.required", { name: t("pages:users.form.password") }) },
              ]}
            >
              <Input.Password
                placeholder={t("pages:users.form.password")}
                prefix={<LockOutlined />}
                autoComplete="off"
              />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item
              label={t("pages:users.form.rePassword")}
              name="rePassword"
              rules={[
                { required: true, message: t("messages:form.required", { name: t("pages:users.form.rePassword") }) },
                validatorRePassword({
                  key: "password",
                  message: t("messages:form.rePassword"),
                  getFieldValue: form.getFieldValue,
                }),
              ]}
            >
              <Input.Password
                placeholder={t("pages:users.form.rePassword")}
                prefix={<LockOutlined />}
                autoComplete="off"
              />
            </Form.Item>
          </Col>
        </>
      ) : null}

      <Col md={12}>
        <Form.Item
          label={t("pages:users.form.lastName")}
          name="lastName"
          rules={[
            { required: true, message: t("messages:form.required", { name: t("pages:users.form.lastName") }) },
            { whitespace: true, message: t("messages:form.required", { name: t("pages:users.form.lastName") }) },
            { max: 255, message: t("messages:form.maxLength", { name: t("pages:users.form.lastName"), length: 255 }) },
          ]}
        >
          <Input placeholder={t("pages:users.form.lastName")} />
        </Form.Item>
      </Col>

      <Col md={12}>
        <Form.Item
          label={t("pages:users.form.firstName")}
          name="firstName"
          rules={[
            { required: true, message: t("messages:form.required", { name: t("pages:users.form.firstName") }) },
            { whitespace: true, message: t("messages:form.required", { name: t("pages:users.form.firstName") }) },
            { max: 255, message: t("messages:form.maxLength", { name: t("pages:users.form.firstName"), length: 255 }) },
          ]}
        >
          <Input placeholder={t("pages:users.form.firstName")} />
        </Form.Item>
      </Col>

      <Col md={24}>
        <Form.Item
          label={t("pages:users.form.email")}
          name="email"
          rules={[
            { required: true, message: t('messages:form.required', { name: t('pages:users.form.email') }) },
            { type: 'email', message: t('messages:form.email') },
            { max: 100, message: t('messages:form.maxLength', { name: t('pages:users.form.email'), length: 100 }) }
          ]}
        >
          <Input
            placeholder={t('pages:users.form.email')}
            type="email"
          />
        </Form.Item>
      </Col>

      {!isEdit ? (
        <>
          <Col md={24}>
            <Form.Item
              label={t("pages:users.form.role")}
              name="roleId"
              rules={[
                { required: true, message: t("messages:form.required", { name: t("pages:users.form.role") }) },
              ]}
            >
              <Select
                placeholder={t("pages:users.form.role")}
                allowClear
                showSearch
              >
                {roles.map((item: any) => (
                  <Option value={item.value} key={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </>
      ) : null}

    </Row>
  );
};

export default UserForm;
