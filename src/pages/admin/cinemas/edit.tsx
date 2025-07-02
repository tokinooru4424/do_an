import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { Button, Form, Col, Row, Spin } from 'antd';
import { LeftCircleFilled, SaveFilled, DeleteFilled } from '@ant-design/icons';
import to from 'await-to-js'

import auth from '@src/helpers/auth'
import { confirmDialog } from '@src/helpers/dialogs'

import useBaseHook from '@src/hooks/BaseHook'
import usePermissionHook from "@src/hooks/PermissionHook";

import CinemaForm from '@src/components/Admin/Cinemas/CinemaForm';
import cinemaService from '@root/src/services/cinemaService';

const Layout = dynamic(() => import('@src/layouts/Admin'), { ssr: false })

const Edit = () => {
  const { t, notify, redirect, router } = useBaseHook();
  const [loading, setLoading] = useState(false);
  const [cinema, setCinema]: any[] = useState<Cinema>();
  const [form] = Form.useForm();
  const { checkPermission } = usePermissionHook();
  const { query } = router
  const deletePer = checkPermission({
    "cinemas": "D"
  })

  const fetchData = async () => {
    let idError: any = null;
    if (!query.id) {
      idError = {
        code: 9996,
        message: 'missing ID'
      }
    }

    if (idError) return notify(t(`errors:${idError.code}`), '', 'error')

    let [cinemaError, cinema]: [any, Cinema] = await to(cinemaService().withAuth().detail({ id: query.id }));
    if (cinemaError) return notify(t(`errors:${cinemaError.code}`), '', 'error')

    setCinema(cinema)
  }

  useEffect(() => {
    fetchData()
  }, []);

  //submit form
  const onFinish = async (values: any): Promise<void> => {
    setLoading(true)

    let [error, result]: any[] = await to(cinemaService().withAuth().edit({
      id: cinema.id,
      ...values
    }));

    setLoading(false)

    if (error) return notify(t(`errors:${error.code}`), '', 'error')

    notify(t("messages:message.recordCinemaUpdated"))
    redirect("frontend.admin.cinemas.index")

    return result
  }

  const onDelete = async (): Promise<void> => {
    let [error, result]: any[] = await to(cinemaService().withAuth().destroy({ id: cinema.id }));
    if (error) return notify(t(`errors:${error.code}`), '', 'error')

    notify(t('messages:message.recordCinemaDeleted'))
    redirect("frontend.admin.cinemas.index")

    return result
  }

  if (!cinema) return <div className="content"><Spin /></div>

  return <>
    <div className="content">
      <Form
        form={form}
        layout="vertical"
        name="editCinema"
        initialValues={{
          name: cinema.name,
          email: cinema.email,
          phoneNumber: cinema.phoneNumber,
          address: cinema.address,
          description: cinema.description
        }}
        onFinish={onFinish}
        scrollToFirstError
      >
        <Row>
          <Col md={{ span: 16, offset: 4 }}>
            <CinemaForm form={form} isEdit={true} />
            <Form.Item wrapperCol={{ span: 24 }} className="text-center">
              <Button onClick={() => router.back()} className="btn-margin-right">
                <LeftCircleFilled /> {t('buttons:back')}
              </Button>
              <Button type="primary" htmlType="submit" className="btn-margin-right" loading={loading}>
                <SaveFilled /> {t('buttons:submit')}
              </Button>
              <Button hidden={!deletePer} danger
                onClick={() => {
                  confirmDialog({
                    title: t('buttons:deleteItem'),
                    content: t('messages:message.deleteConfirm'),
                    onOk: () => onDelete()
                  })
                }}
              >
                <DeleteFilled /> {t('buttons:deleteItem')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  </>
}

Edit.Layout = (props) => {
  const { t } = useBaseHook();
  return <Layout
    title={t("pages:cinemas.edit.title")}
    description={t("pages:cinemas.edit.description")}
    {...props}
  />
}

Edit.permissions = {
  "cinemas": "U"
}

export default Edit
