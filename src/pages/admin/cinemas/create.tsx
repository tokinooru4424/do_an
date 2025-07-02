import React, { useState } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row } from 'antd';
import { LeftCircleFilled, SaveFilled } from '@ant-design/icons';
import to from 'await-to-js'

import useBaseHook from '@src/hooks/BaseHook'

import CinemaForm from '@src/components/Admin/Cinemas/CinemaForm';
import cinemaService from '@root/src/services/cinemaService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Create = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any): Promise<void> => {
    setLoading(true)

    let [error, result]: any[] = await to(cinemaService().withAuth().create(values));

    setLoading(false)

    if (error) return notify(t(`errors:${error.code}`), '', 'error')

    notify(t("messages:message.recordCinemaCreated"))
    redirect("frontend.admin.cinemas.index")

    return result
  }

  return <>
    <div className="content">
      <Form
        form={form}
        name="createCinema"
        layout="vertical"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <CinemaForm form={form} isEdit={false} />
            <Form.Item wrapperCol={{ span: 24 }} className="text-center">
              <Button onClick={() => router.back()} className="btn-margin-right">
                <LeftCircleFilled /> {t('buttons:back')}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="btn-margin-right">
                <SaveFilled /> {t('buttons:submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  </>
}

Create.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t("pages:cinemas.create.title")}
    description={t("pages:cinemas.create.description")}
    {...props}
  />
}

Create.permissions = {
  "cinemas": "C"
}

export default Create
